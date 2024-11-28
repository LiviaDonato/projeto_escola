const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar turmas (R - Read)
// Para acessar essa rota digito /turmas/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        // const busca = req.query.busca || ''
        const { ordenar = 'nome_turma asc' } = req.query

        const pg = req.query.pg || 1 // Obtendo a página de dados
        const limite = 10 // Número de registros por página
        const offset = (pg - 1) * limite // Quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`SELECT * FROM turmas_escola as t
            where lower(t.nome_turma) like $1
            order by ${ordenar}
            limit $2 offset $3`, [`%${busca.toLowerCase()}%`, limite, offset])
        const totalItens = await BD.query(`select count(*) as total FROM turmas_escola as t
            where lower(t.nome_turma) like $1`, [`%${busca.toLowerCase()}%`])
        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
        res.render('turmasTelas/lista', { turmas_escola: buscaDados.rows, busca: busca, ordenar: ordenar, pgAtual: parseInt(pg), totalPgs: totalPgs })
    } catch (erro) {
        console.log('Erro ao listar turmas', erro)
        res.render('turmasTelas/lista', { mensagem: erro })
    }
})
// Rota para abrir tela para criar uma nova turma (C - Create)
// Para acessar /turmas/novo
router.get('/novo', (req, res) => {
    res.render('turmasTelas/criar')
})

router.post('/novo', async (req, res) => {
    const { nome_turma } = req.body
    // const nome_turma = req.body.nome_turma
    await BD.query(`insert into turmas_escola (nome_turma)
        values ($1)`, [nome_turma])
    res.redirect('/turmas')
})
// Excluindo uma turma (D - Delete)
// Para acessar /turmas/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    await BD.query('delete from turmas_escola where id_turma = $1', [id])
    res.redirect('/turmas')
})
// Editar uma turma (U - Update)
// Para acessar /turmas/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from turmas_escola where id_turma = $1', [id])
    res.render('turmasTelas/editar', {turma: resultado.rows[0]})
})
router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { nome_turma } = req.body
    await BD.query(`update turmas_escola set nome_turma = $1
        where id_turma = $2`, [nome_turma, id])
    res.redirect('/turmas')
})

module.exports = router