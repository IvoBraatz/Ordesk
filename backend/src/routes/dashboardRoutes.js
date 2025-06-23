const express = require("express");
const db = require("../config/db");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

// O parâmetro "alias" permite prefixar a coluna (por exemplo, "o." para a tabela orders).
const getDateCondition = (alias = "") => {
  return {
    hoje: `AND ${alias}dataAtual = CURDATE()`,
    semana: `AND ${alias}dataAtual BETWEEN DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND CURDATE()`,
    mes: `AND ${alias}dataAtual BETWEEN DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY) AND CURDATE()`,
    "6meses": `AND ${alias}dataAtual BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND CURDATE()`,
    "1ano": `AND ${alias}dataAtual BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND CURDATE()`
  };
};

// Rota para dados gerais do dashboard (ordens)
router.get("/orders/dashboard", authenticate, async (req, res) => {
  try {
    const filter = req.query.filter;
    let dateCondition = "";
    if (filter) {
      const conditions = getDateCondition("");
      dateCondition = conditions[filter] || "";
    }
    const query = `
      SELECT
        COUNT(*) AS total,
        SUM(finalizada = 1) AS closed,
        SUM(finalizada = 0) AS open,
        SUM(archived = 1) AS archived,
        SUM(finalizada = 1 AND archived = 1) AS closedArchived,
        SUM(finalizada = 1 AND archived = 0) AS closedNotArchived
      FROM orders
      ${dateCondition ? "WHERE 1=1 " + dateCondition : ""}
    `;
    const [rows] = await db.query(query);
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar dados do dashboard:", err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/order_services/employee-hours", authenticate, async (req, res) => {
  try {
    const filter = req.query.filter;
    let dateCondition = "";
    if (filter) {
      const conditions = getDateCondition("o.");
      dateCondition = conditions[filter] || "";
    }

    // Soma diretamente o valor decimal (horas)
    const query = `
      SELECT 
        os.usuario_responsavel, 
        SUM(os.tempo_servico) AS total_hours
      FROM order_services os
      JOIN orders o ON os.order_id = o.id
      WHERE 1=1 ${dateCondition}
      GROUP BY os.usuario_responsavel
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar horas trabalhadas:", err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


// Rota para ordens abertas por cliente (filtrando por data de abertura)
router.get("/orders/open-by-client", authenticate, async (req, res) => {
  try {
    const filter = req.query.filter;
    let dateCondition = "";
    if (filter) {
      const conditions = getDateCondition("o.");
      dateCondition = conditions[filter] || "";
    }
    const query = `
      SELECT o.cliente, COUNT(*) AS openCount
      FROM orders o
      WHERE finalizada = 0 ${dateCondition}
      GROUP BY o.cliente
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar ordens abertas por cliente:", err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para serviços mais usados (filtrando por data de abertura)
router.get("/order_services/most-used", authenticate, async (req, res) => {
  try {
    const filter = req.query.filter;
    let dateCondition = "";
    if (filter) {
      const conditions = getDateCondition("o.");
      dateCondition = conditions[filter] || "";
    }
    const query = `
      SELECT s.descricao AS servico_nome, COUNT(*) AS usageCount
      FROM order_services os
      JOIN servicos s ON os.servico_id = s.id
      JOIN orders o ON os.order_id = o.id
      WHERE 1=1 ${dateCondition}
      GROUP BY s.id
      ORDER BY usageCount DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar serviços mais usados:", err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para usuários com mais ordens (filtrando por data de abertura)
router.get("/order_services/user-usage", authenticate, async (req, res) => {
  try {
    const filter = req.query.filter;
    let dateCondition = "";
    if (filter) {
      const conditions = getDateCondition("o.");
      dateCondition = conditions[filter] || "";
    }
    const query = `
      SELECT os.usuario_responsavel, COUNT(*) AS count
      FROM order_services os
      JOIN orders o ON os.order_id = o.id
      WHERE 1=1 ${dateCondition}
      GROUP BY os.usuario_responsavel
      ORDER BY count DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuários com mais ordens:", err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
