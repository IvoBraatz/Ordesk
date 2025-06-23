const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/authenticate'); // Corrigir a desestruturação

const router = express.Router();

// Criar serviço
router.post('/', authenticate, async (req, res) => {
    const { centroDeCusto, descricao, valor } = req.body;

    try {
        await db.query(
            `INSERT INTO servicos (centroDeCusto, descricao, valor) VALUES (?, ?, ?)`,
            [centroDeCusto, descricao, valor]
        );
        res.status(201).send('Serviço cadastrado com sucesso!');
    } catch (err) {
        console.error('Erro ao cadastrar serviço:', err.message);
        res.status(500).send('Erro ao cadastrar serviço.');
    }
});

// Listar todos os serviços
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM servicos');
        res.status(200).send(results);
    } catch (err) {
        console.error('Erro ao listar serviços:', err.message);
        res.status(500).send('Erro ao listar serviços.');
    }
});

// Buscar um serviço por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.query('SELECT * FROM servicos WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).send('Serviço não encontrado.');
        }

        res.status(200).send(results[0]);
    } catch (err) {
        console.error('Erro ao buscar serviço:', err.message);
        res.status(500).send('Erro ao buscar serviço.');
    }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { centroDeCusto, descricao, valor } = req.body;
  
  try {
    const [result] = await db.query(
      `UPDATE servicos SET centroDeCusto = ?, descricao = ?, valor = ? WHERE id = ?`,
      [centroDeCusto, descricao, valor, id]
    );
  
    if (result.affectedRows === 0) {
      return res.status(404).send("Serviço não encontrado.");
    }
    
    // Atualiza o valor do serviço nas ordens que estão abertas ou finalizadas (archived = 0)
    // apenas se o serviço não for "material"
    if (!descricao.toLowerCase().startsWith('material')) {
      await db.query(
        `UPDATE order_services os
         JOIN orders o ON os.order_id = o.id
         SET os.valor = ?
         WHERE os.servico_id = ? AND o.archived = 0`,
        [valor, id]
      );
    }
  
    res.status(200).send("Serviço e ordens atualizadas com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar serviço:", err.message);
    res.status(500).send("Erro ao atualizar serviço.");
  }
});


  
  // Rota para excluir um serviço (DELETE)
  router.delete("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await db.query("DELETE FROM servicos WHERE id = ?", [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).send("Serviço não encontrado.");
      }
  
      res.status(200).send("Serviço excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir serviço:", err.message);
      res.status(500).send("Erro ao excluir serviço.");
    }
  });

module.exports = router;
