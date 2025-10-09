const express = require('express');
const { PrismaClient } = require('@prisma/client'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { authorizeAdmin, authenticateToken } = require('./authMiddleware');


const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'API do Salão de Beleza funcionando!' });
});


app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10); 
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome,
        email: email,
        senha_hash: senhaHash, 
      },
    });

    res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao registrar o usuário.' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({ error: 'Por favor, forneça email e senha.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { 
        usuarioId: usuario.id,
        tipo: usuario.tipo 
      }, 
      process.env.JWT_SECRET,   
      { expiresIn: '8h' }
    );

    res.status(200).json({ token: token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao fazer o login.' });
  }
});

app.post('/api/servicos', authorizeAdmin, async (req, res) => {
  const { nome, descricao, duracao_minutos, preco } = req.body;
  try {
    const novoServico = await prisma.servico.create({
      data: { nome, descricao, duracao_minutos, preco },
    });
    res.status(201).json(novoServico);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível criar o serviço.' });
  }
});

app.get('/api/servicos', async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany();
    res.status(200).json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar os serviços.' });
  }
});

app.put('/api/servicos/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, duracao_minutos, preco } = req.body;
  try {
    const servicoAtualizado = await prisma.servico.update({
      where: { id: parseInt(id) },
      data: { nome, descricao, duracao_minutos, preco },
    });
    res.status(200).json(servicoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível atualizar o serviço.' });
  }
});

app.delete('/api/servicos/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.servico.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível deletar o serviço.' });
  }
});

app.post('/api/profissionais', authorizeAdmin, async (req, res) => {
  const { usuarioId } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const novoProfissional = await prisma.profissional.create({
      data: {
        usuarioId: usuarioId,
      },
    });
    res.status(201).json(novoProfissional);
  } catch (error) {
    if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Este usuário já é um profissional.' });
    }
    res.status(500).json({ error: 'Não foi possível criar o perfil de profissional.' });
  }
});

app.get('/api/profissionais', async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          }
        }
      }
    });
    res.status(200).json(profissionais);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar os profissionais.' });
  }
});

app.delete('/api/profissionais/:id', authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.profissional.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível deletar o perfil profissional.' });
    }
});

app.get('/api/profissionais/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const profissional = await prisma.profissional.findUnique({
            where: { id: parseInt(id) },
            include: { usuario: { select: { nome: true } } }
        });
        if (!profissional) {
            return res.status(404).json({ error: 'Profissional não encontrado.' });
        }
        res.json(profissional);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar profissional.' });
    }
});

app.get('/api/usuarios', authorizeAdmin, async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
      }
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar os usuários.' });
  }
});

app.post('/api/profissionais/:profissionalId/horarios', authorizeAdmin, async (req, res) => {
  const { profissionalId } = req.params;
  const { dia_da_semana, hora_inicio, hora_fim } = req.body;

  if (dia_da_semana === undefined || !hora_inicio || !hora_fim) {
    return res.status(400).json({ error: 'Dados incompletos. Forneça dia_da_semana, hora_inicio e hora_fim.' });
  }

  try {
    const novoHorario = await prisma.horarioTrabalho.create({
      data: {
        profissionalId: parseInt(profissionalId),
        dia_da_semana: parseInt(dia_da_semana),
        hora_inicio, 
        hora_fim,    
      },
    });
    res.status(201).json(novoHorario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Não foi possível adicionar o horário de trabalho.' });
  }
});


app.get('/api/profissionais/:profissionalId/horarios', authorizeAdmin, async (req, res) => {
    const { profissionalId } = req.params;
    try {
        const horarios = await prisma.horarioTrabalho.findMany({
            where: {
                profissionalId: parseInt(profissionalId),
            },
            orderBy: {
                dia_da_semana: 'asc',
            }
        });
        res.status(200).json(horarios);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível buscar os horários.' });
    }
});

app.delete('/api/horarios/:horarioId', authorizeAdmin, async (req, res) => {
    const { horarioId } = req.params;
    try {
        await prisma.horarioTrabalho.delete({
            where: { id: parseInt(horarioId) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível deletar o horário.' });
    }
});

app.get('/api/profissionais/:profissionalId/disponibilidade', async (req, res) => {
  const { profissionalId } = req.params;
  const { data, servicoId } = req.query;

  if (!data || !servicoId) {
    return res.status(400).json({ error: 'Data e ID do serviço são obrigatórios.' });
  }

  try {
    const servico = await prisma.servico.findUnique({ where: { id: parseInt(servicoId) } });
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    const duracaoServico = servico.duracao_minutos;

    const diaDaSemana = new Date(data + 'T00:00:00').getDay();

    const horarioTrabalho = await prisma.horarioTrabalho.findFirst({
      where: {
        profissionalId: parseInt(profissionalId),
        dia_da_semana: diaDaSemana,
      },
    });

    if (!horarioTrabalho) {
      return res.json([]);
    }

    const slotsDisponiveis = [];
    const intervaloMinutos = 30;

    const inicioTrabalho = parseInt(horarioTrabalho.hora_inicio.split(':')[0]) * 60 + parseInt(horarioTrabalho.hora_inicio.split(':')[1]);
    const fimTrabalho = parseInt(horarioTrabalho.hora_fim.split(':')[0]) * 60 + parseInt(horarioTrabalho.hora_fim.split(':')[1]);

    for (let i = inicioTrabalho; i <= fimTrabalho - duracaoServico; i += intervaloMinutos) {
      const hora = Math.floor(i / 60).toString().padStart(2, '0');
      const minuto = (i % 60).toString().padStart(2, '0');
      slotsDisponiveis.push(`${hora}:${minuto}`);
    }

    const inicioDoDia = new Date(data + 'T00:00:00');
    const fimDoDia = new Date(data + 'T23:59:59');

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        profissionalId: parseInt(profissionalId),
        data_hora_inicio: {
          gte: inicioDoDia, 
          lt: fimDoDia,    
        },
      },
    });

    const horariosLivres = slotsDisponiveis.filter(slot => {
      const inicioSlot = parseInt(slot.split(':')[0]) * 60 + parseInt(slot.split(':')[1]);
      const fimSlot = inicioSlot + duracaoServico;

      const conflita = agendamentos.some(agendamento => {
        const inicioAgendamento = agendamento.data_hora_inicio.getHours() * 60 + agendamento.data_hora_inicio.getMinutes();
        const fimAgendamento = agendamento.data_hora_fim.getHours() * 60 + agendamento.data_hora_fim.getMinutes();

        return inicioSlot < fimAgendamento && fimSlot > inicioAgendamento;
      });

      return !conflita;
    });

    res.json(horariosLivres);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao calcular disponibilidade.' });
  }
});

app.post('/api/agendamentos', authenticateToken, async (req, res) => {
  const { servicoId, profissionalId, data_hora_inicio } = req.body;
  const clienteId = req.user.usuarioId;

  try {
    const servico = await prisma.servico.findUnique({ where: { id: parseInt(servicoId) } });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado.' });

    const inicio = new Date(data_hora_inicio);
    const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60000);

    const agendamentoConflitante = await prisma.agendamento.findFirst({
      where: {
        profissionalId: parseInt(profissionalId),
        
        data_hora_inicio: {
          lt: fim,
        },
        data_hora_fim: {
          gt: inicio, 
        },
      },
    });

    if (agendamentoConflitante) {
      return res.status(409).json({ error: 'Este horário não está mais disponível. Por favor, escolha outro.' });
    }

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        servicoId: parseInt(servicoId),
        profissionalId: parseInt(profissionalId),
        clienteId: clienteId,
        data_hora_inicio: inicio,
        data_hora_fim: fim,
      }
    });
    res.status(201).json(novoAgendamento);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Não foi possível criar o agendamento.' });
  }
});

app.get('/api/meus-agendamentos', authenticateToken, async (req, res) => {
  const clienteId = req.user.usuarioId;
  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: { clienteId: clienteId },
      include: {
        servico: true,
        profissional: { include: { usuario: true } }
      },
      orderBy: { data_hora_inicio: 'desc' }
    });
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar seus agendamentos.' });
  }
});

app.get('/api/servicos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const servico = await prisma.servico.findUnique({
            where: { id: parseInt(id) }
        });
        if (!servico) return res.status(404).json({ error: 'Serviço não encontrado.' });
        res.json(servico);
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível buscar o serviço.' });
    }
});

app.get('/api/profissionais/meus-agendamentos', authenticateToken, async (req, res) => {
  const usuarioId = req.user.usuarioId;
  try {
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId: usuarioId },
    });

    if (!profissional) {
      return res.status(404).json({ error: 'Perfil de profissional não encontrado.' });
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: { profissionalId: profissional.id },
      include: {
        servico: true,
        cliente: {
          select: { nome: true, email: true }
        }
      },
      orderBy: { data_hora_inicio: 'asc' }
    });
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar a agenda.' });
  }
});

app.delete('/api/agendamentos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { usuarioId, tipo } = req.user;

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(id) },
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    let temPermissao = false;

    if (tipo === 'ADMIN') {
      temPermissao = true;
    }

    if (agendamento.clienteId === usuarioId) {
      temPermissao = true;
    }

    if (tipo === 'PROFISSIONAL') {
      const profissional = await prisma.profissional.findUnique({
        where: { usuarioId: usuarioId },
      });
      if (profissional && agendamento.profissionalId === profissional.id) {
        temPermissao = true;
      }
    }

    if (!temPermissao) {
        return res.status(403).json({ error: 'Você não tem permissão para cancelar este agendamento.' });
    }

    await prisma.agendamento.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Não foi possível cancelar o agendamento.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});