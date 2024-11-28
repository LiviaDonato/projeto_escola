const express = require('express')
const router = express.Router()
const BD = require('../db')

// Rota principal do Painel Administrativo
router.get('/', async (req, res) => {
    //    views/admin/dashboard.ejs
    const qAlunos = await BD.query('select count(*) as total_alunos from alunos')
    const qDisciplinas = await BD.query('select count(*) as total_disciplinas from disciplinas')
    const qMediaDisciplinas = await BD.query(`select d.nome_disciplina, avg(ad.media) as media from disciplinas as d
        left join aluno_disciplina as ad on d.id_disciplina = ad.id_disciplina group by d.nome_disciplina`)
    const qStatusAluno = await BD.query(`select status, count(*) as total from aluno_disciplina group by status order by status`)
    const qStatus = await BD.query(`select count(*) as total_status from aluno_disciplina`)
    const taxaApr = (qStatusAluno.rows[0].total / qStatus.rows[0].total_status) * 100
    res.render('admin/dashboard', {
        totalAlunos: qAlunos.rows[0].total_alunos, totalDisciplinas: qDisciplinas.rows[0].total_disciplinas,
        taxaAprovacao: taxaApr, totalReprovados: qStatusAluno.rows[2].total,
        mediaDisciplinas: qMediaDisciplinas.rows, statusAluno: qStatusAluno.rows })
})
module.exports = router