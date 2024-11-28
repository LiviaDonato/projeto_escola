const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar professores (R - Read)
// Para acessar essa rota digito /professores/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        // const busca = req.query.busca || ''
        const { ordenar = 'nome_professor' } = req.query

        const pg = req.query.pg || 1 // Obtendo a página de dados
        const limite = 10 // Número de registros por página
        const offset = (pg - 1) * limite // Quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`SELECT * FROM professores as p
            where lower(p.nome_professor) like $1 or lower(p.telefone) like $1 or lower(p.formacao) like $1
            order by ${ordenar}
            limit $2 offset $3`, [`%${busca.toLowerCase()}%`, limite, offset])
        const totalItens = await BD.query(`select count(*) as total FROM professores as p
            where lower(p.nome_professor) like $1 or lower(p.telefone) like $1 or lower(p.formacao) like $1
            `, [`%${busca.toLowerCase()}%`])
        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
        res.render('professoresTelas/lista', { professores: buscaDados.rows, busca: busca, ordenar: ordenar, pgAtual: parseInt(pg), totalPgs: totalPgs })
    } catch (erro) {
        console.log('Erro ao listar professores', erro)
        res.render('professoresTelas/lista', { mensagem: erro })
    }
})
// Rota para abrir tela para criar um novo professor (C - Create)
// Para acessar /professores/novo
router.get('/novo', (req, res) => {
    res.render('professoresTelas/criar')
})
router.post('/novo', async (req, res) => {
    const { nome_professor, telefone, formacao } = req.body
    //                =
    // const nome_professor = req.body.nome_professor
    // const telefone = req.body.telefone
    // const formacao = req.body.formacao
    await BD.query(`insert into professores (nome_professor, telefone, formacao)
        values ($1, $2, $3)`, [nome_professor, telefone, formacao])
    res.redirect('/professores')
})
// Excluindo um professor (D - Delete)
// Para acessar /professores/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    await BD.query('delete from professores where id_professor = $1', [id])
    res.redirect('/professores')
})
// Editar um professor (U - Update)
// Para acessar /professores/1/editar
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    const resultado = await BD.query('select * from professores where id_professor = $1', [id])
    res.render('professoresTelas/editar', {professor: resultado.rows[0]})
})
router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { nome_professor, telefone, formacao } = req.body
    await BD.query(`update professores set nome_professor = $1, telefone = $2, formacao = $3
        where id_professor = $4`, [nome_professor, telefone, formacao, id])
    res.redirect('/professores')
})

module.exports = router