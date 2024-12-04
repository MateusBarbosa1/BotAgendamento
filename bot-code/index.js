module.exports = function(Client, LocalAuth, qrcode) {
    var state = "";
    const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    const horas1 = ["09:00", "09:40", "10:20", "11:00", "11:40", "13:20", "14:00", "14:40", "15:20", "16:00", "16:40", "17:20", "18:00", "18:40"]; // segunda os dois / bruno todos dias da semana
    const horas2 = ["08:00", "08:40", "09:20", "10:00", "10:40", "11:20", "13:20", "14:00", "14:40", "15:20", "16:00", "16:40", "17:20", "18:00", "18:40"] // wallyson terça a quinta
    const horas3 = ["08:00", "08:40", "09:20", "10:00", "10:40", "11:20", "13:20", "14:00", "14:40", "15:20", "16:00", "16:40", "17:20", "18:00", "18:40","19:20"] // sexta os dois
    const horas4 = ["08:00", "08:40", "09:20", "10:00", "10:40", "11:20", "13:20", "14:00", "14:40", "15:20", "16:00", "16:40", "17:20"]; // sabado os dois

    var horariosDisponiveisArray = [];
    const agendamentosModel = require('../models/agendamentosModel');

    var todas_informacoes = [];
    let usuarioAtual = "";

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
        console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
        console.log(`Estado atual: ${state}`);
        console.log(`Usuário atual: ${usuarioAtual}`);

        // Verifica se o usuário está iniciando a conversa com "oi"
        if (message.body.toLowerCase() === 'oi' || message.body == "0") {
            usuarioAtual = message.from;
            todas_informacoes = []
            state = ""
            console.log(`Usuário atual definido como: ${usuarioAtual}`);
            message.reply(`👋 Olá! Seja Bem Vindo!\nVamos agendar seu corte? ✂️💇‍♂️\n\n🗓️ Escolha uma das opções abaixo para começar:\n\n📅 Agendar um corte - 1\n🔄 Cancelar ou alterar um agendamento - 2\n💬 Falar com um atendente - 3`);
            return;
        }

        // Verifica se o usuário está escolhendo a opção de agendar um corte
        if (message.body === '1') {
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

            message.reply("Ola, selecione um dos nossos barbeiro!\n\nB - Bruno\nW - Wallyson\n\nDigite 0 para voltar ao inicio!")
            state = "barber"
        }

        if(state == "barber" && message.body.toLowerCase() == "b") {
            console.log("Opção 1 selecionada: Agendar corte");
            message.reply('📅 Digite a data do corte!\n\nNo formato: DD/MM/AAAA\nExemplo: 23/12/2024\n\nDigite 0 para voltar ao inicio!');
            state = "data";
            todas_informacoes.push("Bruno");
            return;
        }
        if(state == "barber" && message.body.toLowerCase() == "w") {
            console.log("Opção 1 selecionada: Agendar corte");
            message.reply('📅 Digite a data do corte!\n\nNo formato: DD/MM/AAAA\nExemplo: 23/12/2024\n\nDigite 0 para voltar ao inicio!');
            state = "data";
            todas_informacoes.push("Wallyson");
            return;
        }

        // Verifica se a data é válida e se o estado é "data"
        if (datePattern.test(message.body) && state == "data") {
            console.log("Data recebida e válida");
            
            // Converte a data do usuário para um objeto Date
            const dataRecebida = new Date(converterData(message.body));
            const dataAtual = new Date();
        
            // Verifica se a data recebida é anterior à data atual
            if (dataRecebida < dataAtual) {
                console.log("A data recebida é anterior à data atual.");
                message.reply('🚫 A data escolhida não pode ser uma data passada. Por favor, escolha uma data futura.');
                return; // Interrompe a execução se a data for inválida
            }
            console.log(dataRecebida.getDay())
            if(dataRecebida.getDay() == 0) { // DOMINGO
                message.reply("😭 Desculpe, não trabalhamos no Domingo!\n\nDigite 0 para voltar ao inicio!")
            }

            if(todas_informacoes[0] == "Bruno") {
                if(dataRecebida.getDay() == 1 || dataRecebida.getDay() == 2 || dataRecebida.getDay() == 3 || dataRecebida.getDay() == 4) { // Bruno segunda a quinta
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas1.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 5) { // Bruno sexta
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas3.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 6) { // Bruno sabado
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas4.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                }
            } else if(todas_informacoes[0] == "Wallyson") {
                if(dataRecebida.getDay() == 1) { // Wallyson segunda
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas1.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 2 || dataRecebida.getDay() == 3 || dataRecebida.getDay() == 4) { // Wallyson terça a quinta
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas2.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 5) { // Wallyson sexta
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas3.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕗 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamento igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                } else if(dataRecebida.getDay() == 6) { // Wallyson sabado
                    todas_informacoes.push(message.body);
                    let horariosDisponiveis = '👏 Muito Bem!\n\n Horários disponíveis: \n';
                    let horariosIndisponiveis = [];
                    const agendamentos = await agendamentosModel.getAgendamentos(converterData(message.body), todas_informacoes[0]);
                    for (let i = 0; i < agendamentos.length; i++) {
                        horariosIndisponiveis.push(agendamentos[i].time);
                    }
                
                    // Filtra os horários disponíveis removendo os indisponíveis
                    horariosDisponiveisArray = horas4.filter(horario => !horariosIndisponiveis.includes(horario));
                
                    // Adiciona os horários ao string com a posição +1
                    horariosDisponiveisArray.forEach((horario, index) => {
                        horariosDisponiveis += `🕑 ${horario}\n`;
                    });
                
                    message.reply(horariosDisponiveis + "\n\nDigite o seu horario exatamente igual!\n\nDigite 0 para voltar ao inicio!");
                    state = "horas";
                    return;
                }
            }
        }

        // Verifica se o usuário está escolhendo um horário disponível
        if (state == "horas" && horariosDisponiveisArray.includes(message.body)) {
            console.log("Horário escolhido: " + message.body);
            todas_informacoes.push(message.body);
            message.reply('👏 Bela escolha!\n\nAgora para confirmar seu agendamento: \n\n📅 '+todas_informacoes[1]+'\n🕑 '+todas_informacoes[2]+'\n\nDigite seu nome completo!\n\nDigite 0 para voltar ao inicio!');
            state = "name";
            return;
        }

        // Verifica se o estado é "name" e se a mensagem é do usuário atual
        if (state === "name" && usuarioAtual === message.from) {
            console.log(`Esperando nome do usuário: ${message.from}`);
            if (message.body && message.body.trim() !== "") {
                console.log(`Nome recebido: ${message.body}`);
                todas_informacoes.push(message.body); // Adiciona o nome do usuário
                await agendamentosModel.setAgendamentos(todas_informacoes[0], new Date(converterData(todas_informacoes[1])),todas_informacoes[2],todas_informacoes[3],message.from,new Date());
                message.reply(`🎉 Parabéns! Seu corte foi agendado!\n\nSegue aqui suas informações:\n\n👨 ${todas_informacoes[3]}\n📅 ${todas_informacoes[1]}\n🕑 ${todas_informacoes[2]}\n\nDigite 0 para voltar ao inicio!`);
                state = ""; // Reseta o estado após confirmação
                todas_informacoes = []
            } else {
                console.log("O nome não foi digitado ou está vazio.");
                message.reply('🚫 Por favor, digite seu nome completo para confirmar o agendamento.');
            }
            return;
        }
    });

    client.initialize();
}
