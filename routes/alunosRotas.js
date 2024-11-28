const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar alunos (R - Read)
// Rota localhost:3000/alunos/
router.get('/', async (req, res) => {
    try {
        const { busca = '' } = req.query
        // const busca = req.query.busca || ''
        const { ordenar = 'nome' } = req.query

        // const pg = req.query.pg || 1 // Obtendo a página de dados
        // const limite = 10 // Número de registros por página
        // const offset = (pg - 1) * limite // Quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`select a.id_aluno, a.nome, a.idade, a.email, a.sexo, a.cpf, t.nome_turma 
            from alunos as a left join turmas_escola as t 
            on a.id_turma = t.id_turma 
            where lower(a.nome) like $1 or lower(a.email) like $1 or lower(a.sexo) like $1 
            or lower(a.cpf) like $1 or lower(t.nome_turma) like $1
            order by ${ordenar}`, [`%${busca.toLowerCase()}%`])
        // const totalItens = await BD.query(`select count(*) as total a.id_aluno, a.nome, a.idade, a.email, a.sexo, a.cpf, t.nome_turma 
        //     from alunos as a left join turmas_escola as t 
        //     on a.id_turma = t.id_turma 
        //     where lower(a.nome) like $1 or lower(a.email) like $1 or lower(a.sexo) like $1 
        //     or lower(a.cpf) like $1 or lower(t.nome_turma) like $1`, [`%${busca.toLowerCase()}%`])
        // const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
        res.render('alunosTelas/lista', { vetorDados: buscaDados.rows, busca: busca, ordenar: ordenar })
    } catch (erro) {
        console.log('Erro ao listar alunos', erro)
        res.render('alunosTelas/lista', { mensagem: erro })
    }
})
// Rota para abrir tela para criar um novo aluno (C - Create)
// Para acessar localhost:3000/alunos/novo
router.get('/novo', async (req, res) => {
    try {
        const resultado = await BD.query('select * from turmas_escola order by nome_turma')
        res.render('alunosTelas/criar', { turmasCadastradas: resultado.rows })
    } catch (erro) {
        console.log('Erro ao abrir tela de cadastro de alunos', erro)
        res.render('alunosTelas/lista', { mensagem: erro })
    }
})
router.post('/novo', async (req, res) => {
    try {
        const { nome, idade, email, sexo, cpf, id_turma } = req.body
        // const nome_disciplina = req.body.nome_disciplina
        // const id_professor = req.body.id_professor
        await BD.query('insert into alunos (nome, idade, email, sexo, cpf, id_turma) values ($1, $2, $3, $4, $5, $6)',
            [nome, idade, email, sexo, cpf, id_turma])
        // Redirecionando para a tela de consulta de alunos
        res.redirect('/alunos/')
    } catch (erro) {
        console.log('Erro ao cadastrar aluno', erro)
        res.render('alunosTelas/lista', { mensagem: erro })
    }
})
// Excluindo uma disciplina (D - Delete)
// Para acessar /disciplinas/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    // const id = req.params.id
    await BD.query('delete from alunos where id_aluno = $1', [id])
    res.redirect('/alunos')
})

router.get('/:id/editar', async(req, res) => {
    try {
        const { id } = req.params
        const resultado = await BD.query('select * from alunos where id_aluno = $1', [id])
        // Lista com todos os alunos para o select
        const turCadastradas = await BD.query('select * from turmas_escola order by nome_turma')
        const disCadastradas = await BD.query('select * from disciplinas order by nome_disciplina')
        const notas = await BD.query(`select d.nome_disciplina, ad.media, ad.nr_faltas, ad.status
        from disciplinas as d inner join aluno_disciplina as ad
        on d.id_disciplina = ad.id_disciplina
        where id_aluno = $1`, [id])
        res.render('alunosTelas/editar', {
            aluno: resultado.rows[0], turmasCadastradas: turCadastradas.rows, disciplinasCadastradas: disCadastradas.rows, notas: notas.rows
        })
    } catch (erro) {
        console.log('Erro ao editar aluno', erro)
    }
})
router.post('/:id/editar', async (req, res) => {
    try {
        const { id } = req.params
        const { nome, idade, email, sexo, cpf, id_turma } = req.body
        await BD.query(`update alunos set nome = $1, idade = $2, email = $3, sexo = $4, cpf  = $5, id_turma = $6
            where id_aluno = $7`, [nome, idade, email, sexo, cpf, id_turma, id])
        res.redirect('/alunos/')
    } catch (erro) {
        console.log('Erro ao gravar aluno', erro)
    }
})
// Criando rota para lançar uma nota
router.post('/:id/lancar-nota', async (req, res) => {
    try {
        const { id } = req.params
        const { media, faltas, id_disciplina } = req.body
        await BD.query(`insert into aluno_disciplina (id_disciplina, id_aluno, media, nr_faltas)
            values ($1, $2, $3, $4)`, [id_disciplina, id, media, faltas])
        res.redirect(`/alunos/${id}/editar`)
    } catch (erro) {
        console.log('Erro ao gravar aluno', erro)
    }
})

module.exports = router