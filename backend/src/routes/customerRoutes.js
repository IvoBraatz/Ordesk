const express = require("express");
const db = require("../config/db");
const { authenticate } = require('../middleware/authenticate'); // Corrigir a desestruturação

const router = express.Router();

// Rota para cadastrar um cliente
router.post("/", authenticate, async (req, res) => {
  const {
    codigoCliente,
    nome,
    telefone,
    cpfCnpj,
    tipoDocumento,
    pais,
    estado,
    cidade,
    cep,
    rua,
    numero,
    complemento,
    bairro,
  } = req.body;

  try {
    await db.query(
      `INSERT INTO clientes (codigoCliente, nome, telefone, cpfCnpj, tipoDocumento, pais, estado, cidade, cep, rua, numero, complemento, bairro) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigoCliente,
        nome,
        telefone,
        cpfCnpj,
        tipoDocumento,
        pais,
        estado,
        cidade,
        cep,
        rua,
        numero,
        complemento,
        bairro,
      ]
    );
    res.status(201).send("Cliente cadastrado com sucesso!");
  } catch (err) {
    console.error("Erro ao cadastrar cliente:", err.message);
    res.status(500).send("Erro ao cadastrar cliente.");
  }
});

// Rota para listar todos os clientes
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM clientes");
    res.status(200).send(results);
  } catch (err) {
    console.error("Erro ao listar clientes:", err.message);
    res.status(500).send("Erro ao listar clientes.");
  }
});

// Rota para atualizar um cliente (PUT)
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const {
    codigoCliente,
    nome,
    telefone,
    cpfCnpj,
    tipoDocumento,
    pais,
    estado,
    cidade,
    cep,
    rua,
    numero,
    complemento,
    bairro,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE clientes 
       SET codigoCliente = ?,
           nome = ?,
           telefone = ?,
           cpfCnpj = ?,
           tipoDocumento = COALESCE(?, tipoDocumento),
           pais = ?,
           estado = ?,
           cidade = ?,
           cep = ?,
           rua = ?,
           numero = ?,
           complemento = ?,
           bairro = ? 
       WHERE id = ?`,
      [
        codigoCliente,
        nome,
        telefone,
        cpfCnpj,
        tipoDocumento, // Se for null, COALESCE manterá o valor antigo
        pais,
        estado,
        cidade,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send("Cliente não encontrado.");
    }

    res.status(200).send("Cliente atualizado com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err.message);
    res.status(500).send("Erro ao atualizar cliente.");
  }
});


// Rota para excluir um cliente (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM clientes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Cliente não encontrado.");
    }

    res.status(200).send("Cliente excluído com sucesso!");
  } catch (err) {
    console.error("Erro ao excluir cliente:", err.message);
    res.status(500).send("Erro ao excluir cliente.");
  }
});

module.exports = router;
