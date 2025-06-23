const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/authenticate');
const fileUpload = require('express-fileupload');
const AWS = require('aws-sdk');
const path = require('path');
const moment = require("moment-timezone");

const router = express.Router();
router.use(fileUpload());

// Configuração do AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.data,
    ContentType: file.mimetype, // Define o tipo de conteúdo corretamente
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location; // Retorna o link fixo
  } catch (err) {
    console.error('Erro ao enviar arquivo para o S3:', err.message);
    throw new Error('Erro ao enviar imagem para o S3.');
  }
};

// Rota POST para criar uma nova ordem
router.post("/", authenticate, async (req, res) => {
  const {
    numeroOrdem,
    prazoEntrega,
    cliente,
    telefone,
    cpfCnpj,
    solicitante,
    departamento,
    descricao,
    quantidade,
    material,
    observacao,
  } = req.body;

  try {
    let imagensLinks = [];

    // Upload de imagens para o S3 (se houver)
    if (req.files && req.files.imagens) {
      const imagens = Array.isArray(req.files.imagens)
        ? req.files.imagens
        : [req.files.imagens];
      
      for (let imagem of imagens) {
        const fileKey = `orders/${numeroOrdem}/${Date.now()}-${path.basename(imagem.name)}`;
        const link = await uploadToS3(imagem, fileKey);
        imagensLinks.push(link);
      }
    }

    // Calcula a data atual (fuso horário brasileiro)
    const dataAtual = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD");

    // Insere a nova ordem no banco de dados
    await db.query(
      `INSERT INTO orders (numeroOrdem, dataAtual, prazoEntrega, cliente, telefone, cpfCnpj, solicitante, departamento, descricao, quantidade, material, observacao, imagens) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numeroOrdem,
        dataAtual,
        prazoEntrega,
        cliente,
        telefone,
        cpfCnpj,
        solicitante,
        departamento,
        descricao,
        quantidade,
        material,
        observacao,
        JSON.stringify(imagensLinks),
      ]
    );

    res.status(201).send("Ordem criada com sucesso!");
  } catch (err) {
    console.error("Erro ao criar ordem:", err.message);
    res.status(500).send("Erro ao criar ordem.");
  }
});

// Rota para listar ordens pendentes (não finalizadas e não arquivadas)
router.get('/open', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT id, numeroOrdem, cliente, solicitante, departamento, descricao, material, quantidade, 
              dataAtual, prazoEntrega, finalizada, dataFinalizacao, archived
       FROM orders 
       WHERE archived = 0 AND finalizada = 0
       ORDER BY dataAtual DESC`
    );
    
    res.status(200).json(results || []);
  } catch (err) {
    console.error('Erro ao listar ordens pendentes:', err.message);
    res.status(500).send('Erro ao listar ordens pendentes');
  }
});

// Rota para listar ordens finalizadas (finalizada=1 e archived=0)
router.get('/finalized', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT id, numeroOrdem, cliente, descricao, material, quantidade, 
              dataAtual, prazoEntrega, finalizada, dataFinalizacao, archived
       FROM orders 
       WHERE finalizada + 0 = 1 AND archived + 0 = 0
       ORDER BY dataFinalizacao DESC`
    );
    res.status(200).json(results || []);
  } catch (err) {
    console.error('Erro ao listar ordens finalizadas:', err.message);
    res.status(500).send('Erro ao listar ordens finalizadas');
  }
});

// Listar somente as ordens arquivadas
router.get('/archived', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT id, numeroOrdem, cliente, descricao, material, quantidade, 
              dataAtual, prazoEntrega, finalizada, dataFinalizacao, archived
       FROM orders 
       WHERE archived = 1
       ORDER BY dataFinalizacao DESC`
    );
    res.status(200).json(results || []);
  } catch (err) {
    console.error('Erro ao listar ordens arquivadas:', err.message);
    res.status(500).send('Erro ao listar ordens arquivadas');
  }
});

// Buscar detalhes de uma ordem
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).send('Order not found');

    const order = results[0];
    // Parse do JSON de imagens (caso exista)
    if (order.imagens) {
      order.imagens = JSON.parse(order.imagens);
    }
    res.status(200).json(order);
  } catch (err) {
    console.error('Erro ao buscar detalhes da ordem:', err.message);
    res.status(500).send('Erro ao buscar detalhes da ordem');
  }
});

// Adicionar serviço à ordem
router.post('/:id/add-service', async (req, res) => {
  const { id } = req.params;
  const { servicoId, descricao, usuarioResponsavel, tempoServico, valor, observacao } = req.body;

  try {
    const [orderExists] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (!orderExists.length) return res.status(404).send('Ordem não encontrada');

    await db.query(
      `INSERT INTO order_services (order_id, servico_id, descricao, usuario_responsavel, tempo_servico, valor, observacao) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, servicoId, descricao, usuarioResponsavel, tempoServico, valor, observacao || null]
    );

    res.status(200).send('Serviço adicionado à ordem com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar serviço à ordem:', err.message);
    res.status(500).send('Erro ao adicionar serviço.');
  }
});

router.put('/:id/update-details', authenticate, async (req, res) => {
  const { id } = req.params;
  // Incluímos prazoEntrega aqui:
  const {
    cliente,
    telefone,
    descricao,
    quantidade,
    material,
    observacao,
    numeroOrdem,
    solicitante,
    departamento,
    prazoEntrega
  } = req.body;

  // Verifica se o usuário tem permissão para editar (regra 1):
  if (!req.user || req.user.user_type !== 1) {
    return res.status(403).send("Apenas usuários com a regra 1 podem editar os detalhes da ordem.");
  }

  try {
    // Verifica se a ordem existe e se está arquivada
    const [orderResult] = await db.query('SELECT archived FROM orders WHERE id = ?', [id]);
    if (!orderResult.length) {
      return res.status(404).send("Ordem não encontrada.");
    }
    if (Number(orderResult[0].archived) === 1) {
      return res.status(403).send("Esta ordem está arquivada e não pode ser editada.");
    }

    // Se prazoEntrega vier vazio ou nulo, podemos manter como está no BD. Mas se vier algo,
    // convertemos para YYYY-MM-DD sem shift.
    let dataPrazo = null;
    if (prazoEntrega) {
      // Usa moment para parsear a string 'YYYY-MM-DD' e formatar novamente como 'YYYY-MM-DD'
      const parsed = moment(prazoEntrega, 'YYYY-MM-DD', true); 
      if (!parsed.isValid()) {
        return res.status(400).send("Formato de data inválido para prazoEntrega. Use YYYY-MM-DD.");
      }
      dataPrazo = parsed.format('YYYY-MM-DD');
    }

    // Atualiza os detalhes da ordem, incluindo solicitante, departamento e prazoEntrega
    await db.query(
      `UPDATE orders 
       SET cliente = ?,
           telefone = ?,
           descricao = ?,
           quantidade = ?,
           material = ?,
           observacao = ?,
           numeroOrdem = ?,
           solicitante = ?,
           departamento = ?,
           prazoEntrega = COALESCE(?, prazoEntrega)
       WHERE id = ?`,
      [
        cliente,
        telefone,
        descricao,
        quantidade,
        material,
        observacao,
        numeroOrdem,
        solicitante,
        departamento,
        dataPrazo, // se for null, mantém o prazoEntrega atual
        id
      ]
    );
    
    const [updatedOrder] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    // Se os links das imagens estiverem armazenados como JSON, faça o parse:
    if (updatedOrder[0].imagens) {
      updatedOrder[0].imagens = JSON.parse(updatedOrder[0].imagens);
    }
    res.status(200).json(updatedOrder[0]);
  } catch (err) {
    console.error("Erro ao atualizar os detalhes da ordem:", err.message);
    res.status(500).send("Erro ao atualizar os detalhes da ordem.");
  }
});


// Atualizar imagem inicial da ordem
router.put('/:id/update-initial-image', async (req, res) => {
  const { id } = req.params;

  // Verifica se o arquivo foi enviado
  if (!req.files || !req.files.imagemInicial) {
    return res.status(400).send("Imagem inicial é obrigatória para a atualização.");
  }

  const imagemInicial = req.files.imagemInicial;
  const fileKey = `orders/${id}/initial-${Date.now()}-${imagemInicial.name}`;

  try {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: imagemInicial.data,
      ContentType: imagemInicial.mimetype,
    };

    // Realiza o upload para o S3
    const uploadResult = await s3.upload(uploadParams).promise();

    // Recupera o registro atual da ordem para atualizar o campo 'imagens'
    const [orderResults] = await db.query('SELECT imagens FROM orders WHERE id = ?', [id]);
    if (orderResults.length === 0) {
      return res.status(404).send("Ordem não encontrada.");
    }

    let imagens = [];
    if (orderResults[0].imagens) {
      try {
        imagens = JSON.parse(orderResults[0].imagens);
      } catch (err) {
        imagens = [];
      }
    }

    // Se não houver imagem inicial (array vazio), adiciona o novo link; caso contrário, substitui o primeiro item
    if (imagens.length === 0) {
      imagens.push(uploadResult.Location);
    } else {
      imagens[0] = uploadResult.Location;
    }

    // Atualiza a ordem com o novo array de imagens
    await db.query('UPDATE orders SET imagens = ? WHERE id = ?', [JSON.stringify(imagens), id]);

    res.status(200).json({ imagem: uploadResult.Location });
  } catch (err) {
    console.error("Erro ao atualizar imagem inicial:", err.message);
    res.status(500).send("Erro ao atualizar imagem inicial.");
  }
});

// Rota PUT para atualizar a imagem final
router.put('/:id/edit-final', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).send("Nenhuma imagem enviada.");
    }
    // Busca a ordem para obter o número da ordem (caso seja necessário para gerar o nome do arquivo)
    const [results] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).send("Ordem não encontrada");
    const order = results[0];
    
    const image = req.files.image;
    const fileKey = `orders/${order.numeroOrdem}/${Date.now()}-${path.basename(image.name)}`;
    const link = await uploadToS3(image, fileKey);
    
    // Atualiza a coluna que armazena a imagem final
    await db.query("UPDATE orders SET imagemServico = ? WHERE id = ?", [link, id]);
    res.status(200).json({ message: "Imagem final atualizada com sucesso", link });
  } catch (err) {
    console.error("Erro ao atualizar imagem final:", err.message);
    res.status(500).send("Erro ao atualizar imagem final.");
  }
});

// Listar serviços de uma ordem (com join para obter o centro de custo)
router.get('/:id/services', async (req, res) => {
  const { id } = req.params;
  try {
    const [services] = await db.query(
      `SELECT 
          os.id, 
          os.servico_id, 
          os.descricao, 
          os.usuario_responsavel, 
          os.tempo_servico,
          CASE 
            WHEN LOWER(os.descricao) LIKE 'material%' THEN os.valor
            WHEN o.archived = 0 THEN s.valor 
            ELSE os.valor 
          END AS valor,
          os.observacao, 
          s.centroDeCusto
       FROM order_services os
       JOIN servicos s ON os.servico_id = s.id
       JOIN orders o ON os.order_id = o.id
       WHERE os.order_id = ?`,
      [id]
    );
    res.status(200).json(services);
  } catch (err) {
    console.error('Erro ao listar serviços da ordem:', err.message);
    res.status(500).send('Erro ao listar serviços da ordem.');
  }
});



// Atualizar serviço adicionado à ordem
router.put('/:order_id/update-service/:service_id', async (req, res) => {
  const { order_id, service_id } = req.params;
  // Incluímos 'valor' no payload para que, no caso de material, seja usado o valor informado na ordem
  const { tempoServico, descricao, usuarioResponsavel, servicoId, observacao, valor } = req.body;

  try {
    // Verifica se a ordem existe e se não está arquivada
    const [orderResult] = await db.query('SELECT archived FROM orders WHERE id = ?', [order_id]);
    if (!orderResult.length) {
      return res.status(404).send('Ordem não encontrada.');
    }
    if (Number(orderResult[0].archived) === 1) {
      return res.status(403).send('Esta ordem está arquivada e os serviços não podem ser editados.');
    }

    // Verifica se o serviço existe na ordem
    const [existing] = await db.query(
      'SELECT id FROM order_services WHERE id = ? AND order_id = ?',
      [service_id, order_id]
    );
    if (!existing.length) {
      return res.status(404).send('Serviço não encontrado na ordem.');
    }

    // Se a descrição enviada inicia com "material" (pode ter texto adicional),
    // então NÃO deve buscar o valor atualizado na tabela 'servicos'
    // e sim usar o valor que vem do payload (valor já armazenado ou informado)
    const isMaterial = descricao.toLowerCase().startsWith('material');
    let updatedValor;
    if (isMaterial) {
      updatedValor = valor;
    } else {
      // Para serviços não material, busca o valor atualizado no cadastro
      const [serviceData] = await db.query('SELECT valor FROM servicos WHERE id = ?', [servicoId]);
      if (!serviceData.length) {
        return res.status(404).send('Serviço não encontrado no cadastro.');
      }
      updatedValor = serviceData[0].valor;
    }

    // Atualiza os dados na tabela order_services com o valor determinado
    await db.query(
      `UPDATE order_services 
       SET tempo_servico = ?, descricao = ?, usuario_responsavel = ?, servico_id = ?, valor = ?, observacao = ? 
       WHERE id = ? AND order_id = ?`,
      [tempoServico, descricao, usuarioResponsavel, servicoId, updatedValor, observacao || null, service_id, order_id]
    );

    res.status(200).send('Serviço atualizado com sucesso!');
  } catch (err) {
    console.error('Erro ao atualizar o serviço:', err.message);
    res.status(500).send('Erro ao atualizar o serviço.');
  }
});

// Arquivar ordem
router.put('/:id/archive', async (req, res) => {
  const { id } = req.params;
  try {
    // Atualiza a coluna 'archived' para 1
    await db.query('UPDATE orders SET archived = 1 WHERE id = ?', [id]);

    // Retorna a ordem atualizada (opcional)
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao arquivar a ordem:', error);
    res.status(500).json({ error: 'Erro ao arquivar a ordem' });
  }
});

// Rota para remover um serviço da ordem
router.delete('/:order_id/services/:service_id', async (req, res) => {
  const { order_id, service_id } = req.params;
  try {
    // Verifica se o serviço existe para a ordem informada
    const [result] = await db.query(
      'SELECT id FROM order_services WHERE id = ? AND order_id = ?',
      [service_id, order_id]
    );
    if (!result.length) {
      return res.status(404).send('Serviço não encontrado na ordem.');
    }

    // Remove o registro da tabela order_services
    await db.query(
      'DELETE FROM order_services WHERE id = ? AND order_id = ?',
      [service_id, order_id]
    );

    res.status(200).send('Serviço removido com sucesso!');
  } catch (err) {
    console.error('Erro ao remover o serviço:', err.message);
    res.status(500).send('Erro ao remover o serviço.');
  }
});

// Finalizar ordem (envio de imagem final)
router.put('/:id/finalizar', async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.files || !req.files.imagemServico) {
      return res.status(400).send("Imagem é obrigatória para finalizar a ordem.");
    }

    const imagemServico = req.files.imagemServico;
    const fileKey = `orders/${id}/servico-${Date.now()}-${imagemServico.name}`;

    // Faz o upload para o S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: imagemServico.data,
      ContentType: imagemServico.mimetype,
    };
    const uploadResult = await s3.upload(uploadParams).promise();

    // Obtém a data/hora atual para registrar a finalização
    const dataFinalizacao = moment().format("YYYY-MM-DD HH:mm:ss");

    // Atualiza a ordem no banco de dados com o link da imagem e a data de finalização
    await db.query(
      `UPDATE orders 
       SET finalizada = 1, 
           imagemServico = ?, 
           dataFinalizacao = ? 
       WHERE id = ?`,
      [uploadResult.Location, dataFinalizacao, id]
    );

    res.status(200).send("Ordem finalizada com sucesso!");
  } catch (err) {
    console.error("Erro ao finalizar ordem:", err.message);
    res.status(500).send("Erro ao finalizar ordem.");
  }
});

module.exports = router;
