const {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');

/**
 * Muestra la ayuda.
 */
exports.helpCmd= rl => {
    log("comandos:");
    log("h|help - muestra esta ayuda.");
    log("list- listar los quizzes existentes.");
    log("show <id> - muestra la pregunta y la respuesta del quiz indicado.");
    log("add - añadir un nuevo quiz interactivamente.");
    log("delete <id> - Borrar el quiz indicado");
    log("edit <id> - Editar el quiz indicado");
    log("test <id> - Probar el quiz indicado");
    log("p|play - jugar a preguntar aleatoriamente.");
    log("q|quit - salir del programa.");
    log("credits - creditos.");
    rl.prompt();
}

exports.listCmd= rl => {
    model.getAll().forEach((quiz,id) => {
        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();

}
exports.showCmd= (rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(`[${colorize(id, 'magenta')}]: ${ quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch (error) {
            errorlog(error.message);
        }
    }
    rl.prompt();

};

exports.addCmd= rl => {
    rl.question(colorize('Introduzca una pregunta:', 'red'), question => {
        rl.question(colorize('Introduzca la respuesta:', 'red'), answer => {
            model.add(question, answer);
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);

            rl.prompt();
        });
    });
};
exports.deleteCmd= (rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
    } else {
        try {
            model.deleteByIndex(id);
        } catch (error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
}
exports.editCmd= (rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize('Introduzca una pregunta:','red'),question =>{

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize('Introduzca una respuesta:','red'),answer =>{
                    model.update(id,question,answer);
                    log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.testCmd= (rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);

            rl.question( colorize( quiz.question, ' red' ) ,answer =>{
                console.log('Su respuesta es: ');
                respuesta=answer.toLowerCase();
                respuesta2=quiz.answer.toLowerCase();

                if(respuesta2===respuesta.trim()) {
                    log("Su respuesta es: CORRECTA",);


                    biglog('CORRECTO', 'green');
                    } else {
                    log("Su respuesta es: INCORRECTA",);


                    biglog('INCORRECTO', 'red');
                    }
                    rl.prompt();


            });

        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.playCmd= rl => {
    let score = 0;

    let toBeResolved=[];
    toBeResolved=model.getAll();

        const playOne = () =>{
        if(toBeResolved.length===0){
            log(`No hay más preguntas`);
            log(`Tu puntuación es: ${score} ${colorize('=>', 'magenta')}`);
            rl.prompt();
        }else{

            var indice = Math.floor(Math.random()*toBeResolved.length-1);

            let quiz= model.getByIndex(indice);

            rl.question(quiz.question,answer => {
            log(`Introduzca una respuesta:`);
                    respuesta = answer.toLowerCase();
                    respuesta2 = quiz.answer.toLowerCase();
                if(score=== model.getAll()){
                    log(`No hay nada más que preguntar. Tu puntuación es: `);
                    biglog(score, 'red');
                    rl.prompt();
                }else if (respuesta2 === respuesta.trim()) {
                        toBeResolved.splice(indice,1);
                    log("Su respuesta es: CORRECTA",);


                    biglog('CORRECTO', 'green');
                        score++;
                        log(`Llevas: ${score} ${colorize('=>', 'magenta')} aciertos.`);


                        playOne();
                    } else {
                    log("Su respuesta es: INCORRECTA",);


                    biglog('INCORRECTO', 'red');
                        log(`Tu puntuación es: ${score} ${colorize('=>', 'magenta')}.`);
                        rl.prompt();
                    }
            });

        }
    }
    playOne();
};

exports.creditsCmd= rl => {
    log('Autores de la práctica:');
    log('Ana de la Iglesia','green');
    log('Adrián Simón','green');
    rl.prompt();

}
exports.quitCmd= rl => {
    rl.close();

}