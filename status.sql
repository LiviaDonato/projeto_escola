create or replace function atualizar_status_aluno()
returns trigger as $$
begin
	-- Calcula a situação do aluno com base na nota e faltas
	if new.media >= 7 and new.nr_faltas <= 25 then
		new.status := 'Aprovado';
	elsif new.media >= 5 and new.nr_faltas <= 25 then
		new.status := 'Recuperação';
	else
		new.status := 'Reprovado';
	end if;
	return new;
end;
$$ language plpgsql;

create trigger trigger_atualiza_status
before insert or update on aluno_disciplina
for each row
execute function atualizar_status_aluno();

select * from aluno_disciplina

update aluno_disciplina set status = null

select count(*) as total_alunos from alunos

select count(*) as total_aprovados from aluno_disciplina where status = 'Aprovado'

select count(*) as total_reprovados from aluno_disciplina where status = 'Reprovado'

select d.nome_disciplina, avg(ad.media) from disciplinas as d
inner join aluno_disciplina as ad on d.id_disciplina = ad.id_disciplina
group by d.nome_disciplina

select status, count(*) as total from aluno_disciplina group by status order by status