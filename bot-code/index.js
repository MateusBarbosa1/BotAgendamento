module.exports = function(Client, LocalAuth, qrcode) {
    var state = "";
    const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    var horariosDisponiveisArray = [];

    const agendamentosModel = require('../models/agendamentosModel');
    

    var todas_informacoes = [];
    let usuarioAtual = "";

    state2 = ""

    const client = new Client({
        authStrategy: new LocalAuth(), // Salva sessão localmente
    });

    function converterData(data) {
        // Divide a data pelo separador '/' e reorganiza os valores
        const partes = data.split('/');
        if (partes.length === 3) {
            // Retorna no formato AAAA-MM-DD
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return null; // Retorna null se a data não estiver no formato correto
    }
    function isUUID(message) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(message);
    }
    
    // Gerar QR Code para login
    client.on('qr', (qr) => {
        console.log('Escaneie este QR Code com seu WhatsApp:');
        qrcode.generate(qr, { small: true });
    });
    
    // Confirmar login
    client.on('ready', () => {
        console.log('Bot está conectado!');
    });
    
    // Responder mensagens
    client.on('message_create', async (message) => {

        // Verifica se o usuário está iniciando a conversa com "oi"
        if (message.body.toLowerCase() === 'oi' || message.body == "0") {
            usuarioAtual = message.from;
            todas_informacoes = []
            state = ""
            message.reply(`👋 Olá! Seja Bem Vindo!\nVamos agendar seu corte? ✂️💇‍♂️\n\n🗓️ Escolha uma das opções abaixo para começar:\n\n📅 Agendar um corte - 1\n🔄 Cancelar um agendamento - 2\n💬 Falar com um atendente - 3`);
            return;
        }

        // Verifica se o usuário está escolhendo a opção de agendar um corte
        if (message.body === '1' && state == "") {
            const agendamentosModel = require("../models/agendamentosModel");
            const agendamentos = await agendamentosModel.getAgendamentosNumber(message.from);

            let numero_de_vezes = 0;

            for(let i = 0;i < agendamentos.length;i++) {
                if(agendamentos[0].horarioAgendamento.toLocaleDateString('pt-BR') == new Date().toLocaleDateString('pt-BR')) {
                    numero_de_vezes++;
                }
            }

            if(numero_de_vezes == 2) {
                message.reply("😭 Infelizmente não é possivel fazer mais de 2 agendamentos por dia!\n\nDigite 0 para voltar ao inicio!");
                return

            }

            message.reply("Ola, selecione qual serviço você deseja!\n\n1 - Cabelo\n2 - Barba\n3 - Cabelo/Barba\n\nDigite 0 para voltar ao inicio!")
            state = "servico"
            return
        }
        if(message.body === '2' && state == "") {
            message.reply("Ola, para cancelar o seu corte siga esses passos!\n\nEnvie seu ID do agendamento\n\nobs: ele está no final da mensagem de confirmação do agendamento!\n\nDigite 0 para voltar ao inicio!")
            state2 = "cancelar"
            return
        }
        if(message.body === '3' && state == "") {
            message.reply("Ola, tudo bem? sua mensagem foi direcionada para o atendente!\n\n🕗 Pode levar um tempo para ele responder!\n\nDigite 0 para voltar ao inicio!")
            state2 = "cancelar"
            return
        }
        if(state2 == "cancelar" && isUUID(message.body) == true) {
            const agendamentosModel = require("../models/agendamentosModel");
            await agendamentosModel.deleteAgendamentoID(message.body);
            message.reply("✅ Agendamento Cancelado com sucesso!\n\nDigite 0 para voltar ao inicio!");
        }
        if(state == "servico" && message.body === '1') {
            todas_informacoes.push("Cabelo");
            message.reply("Agora selecione um dos nossos barbeiro!\n\nB - Bruno\nW - Wallyson\n\nDigite 0 para voltar ao inicio!")
            state = "barber"
            return
        }
        if(state == "servico" && message.body === '2') {
            todas_informacoes.push("Barba");
            message.reply("Agora selecione um dos nossos barbeiro!\n\nB - Bruno\nW - Wallyson\n\nDigite 0 para voltar ao inicio!")
            state = "barber"
            return
        }
        if(state == "servico" && message.body === '3') {
            todas_informacoes.push("Cabelo/Barba");
            message.reply("Agora selecione um dos nossos barbeiro!\n\nB - Bruno\nW - Wallyson\n\nDigite 0 para voltar ao inicio!")
            state = "barber"
            return
        }

        if(state == "barber" && message.body.toLowerCase() == "b") {
            message.reply('📅 Digite a data do corte!\n\nNo formato: DD/MM/AAAA\nExemplo: 23/12/2024\n\nDigite 0 para voltar ao inicio!');
            state = "data";
            todas_informacoes.push("Bruno");
            return;
        }
        if(state == "barber" && message.body.toLowerCase() == "w") {
            message.reply('📅 Digite a data do corte!\n\nNo formato: DD/MM/AAAA\nExemplo: 23/12/2024\n\nDigite 0 para voltar ao inicio!');
            state = "data";
            todas_informacoes.push("Wallyson");
            return;
        }

        // Verifica se a data é válida e se o estado é "data"
        if (datePattern.test(message.body) && state == "data") {
            
            // Converte a data do usuário para um objeto Date
            const dataRecebida = new Date(converterData(message.body));
            const dataAtual = new Date();
        
            // Verifica se a data recebida é anterior à data atual
            if (dataRecebida < dataAtual) {
                message.reply('🚫 A data escolhida não pode ser uma data passada. Por favor, escolha uma data futura.');
                return; // Interrompe a execução se a data for inválida
            }
            console.log(dataRecebida.getDay())
            if(dataRecebida.getDay() == 0) { // DOMINGO
                message.reply("😭 Desculpe, não trabalhamos no Domingo!\n\nDigite 0 para voltar ao inicio!")
            }

            if(todas_informacoes[1] == "Bruno") {
                if(dataRecebida.getDay() == 1) { // Bruno segunda a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosBruno("Segunda");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 2) { // Bruno segunda a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosBruno("Terca");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 3) { // Bruno segunda a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosBruno("Quarta");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 4) { // Bruno segunda a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosBruno("Quinta");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 5) { // Bruno sexta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosBruno("Sexta");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 6) { // Bruno sabado
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosBruno("Sabado");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                }
            } else if(todas_informacoes[1] == "Wallyson") {
                if(dataRecebida.getDay() == 1) { // Wallyson segunda
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosWallyson("Segunda");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 2) { // Wallyson terça a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosWallyson("Terca");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 3) { // Wallyson terça a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosWallyson("Quarta");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 4) { // Wallyson terça a quinta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosWallyson("Quinta");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 5) { // Wallyson sexta
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosWallyson("Sexta");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 6) { // Wallyson sabado
                    todas_informacoes.push(message.body);
                    const horariosModel = require('../models/horariosModel');
                    const horarios = await horariosModel.getHorariosWallyson("Sabado");
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[1]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horarios[0].horarios.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                }
            }
        }

        // Verifica se o usuário está escolhendo um horário disponível
        if (state == "horas" && horariosDisponiveisArray.includes(message.body)) {
            todas_informacoes.push(message.body);
            message.reply('👏 Bela escolha!\n\nAgora para confirmar seu agendamento: \n\n📅 '+todas_informacoes[2]+'\n🕑 '+todas_informacoes[3]+'\n\nDigite seu nome completo!\n\nDigite 0 para voltar ao inicio!');
            state = "name";
            return;
        }

        // Verifica se o estado é "name" e se a mensagem é do usuário atual
        if (state === "name" && usuarioAtual === message.from) {
            if (message.body && message.body.trim() !== "") {
                todas_informacoes.push(message.body); // Adiciona o nome do usuário
                const agendamento = await agendamentosModel.setAgendamentos(todas_informacoes[0],todas_informacoes[1], new Date(converterData(todas_informacoes[2])),todas_informacoes[3],todas_informacoes[4],message.from,new Date());
                message.reply(`🎉 Parabéns! Seu corte foi agendado!\n\nSegue aqui suas informações:\n\n👨 ${todas_informacoes[4]}\n📅 ${todas_informacoes[2]}\n🕑 ${todas_informacoes[3]}\n\nID do agendamento: ${agendamento.id}\n\nDigite 0 para voltar ao inicio!`);
                state = ""; // Reseta o estado após confirmação
                todas_informacoes = []
            } else {
                message.reply('🚫 Por favor, digite seu nome completo para confirmar o agendamento.');
            }
            return;
        }
    });

    client.initialize();
}
