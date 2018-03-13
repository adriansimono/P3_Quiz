const Sequelize =require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');

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

    models.quiz.findAll()
        .each(quiz => {
                log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const validateId = id =>{
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parametro <id>.`));
        }else {
            id= parseInt(id); //Coger parte entera y descartar lo demás
            if(Number.isNaN(id)){
                reject(new Error(`El valor del parametro <id> no es un número.`));
            }else{
                resolve(id);
            }
        }
    });
};

exports.showCmd= (rl,id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id =${id}.`);
            }
            log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


const makeQuestion =(rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

exports.addCmd = rl => {
    makeQuestion(rl,' Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, ' Introduzca la respuesta ')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz=> {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(`${colorize('Se ha añadido','magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message})=> errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(()=> {
            rl.prompt
        });
};




exports.deleteCmd= (rl,id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
        })
            .then(()=> {
                rl.prompt();
            });
};
exports.editCmd= (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error()(`No existe un quiz asociado al id=${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            return makeQuestion(rl, 'Introduzca la pregunta: ')
                .then(q=> {
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                    return makeQuestion(rl, 'Introduzca la respuesta: ')
                        .then(a => {
                            quiz.question =q;
                            quiz.question = a;
                            return quiz;
                        });
                });
        })
            .then(quiz => {
                return quiz.save();
            })
            .then(quiz => {
                log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', ' magenta')} ${quiz.answer}`);
            })
            .catch(Sequelize.ValidationError, error => {
                errorlog('El quiz es erroneo');
                error.errors.forEach(({message}) => errorlog(message));
            })
            .catch(error=> {
                errorlog(error.message);
            })
            .then(() => {
                rl.prompt();
            });
};

exports.testCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error()(`No existe un quiz asociado al id=${id}.`);
            }

            return makeQuestion(rl, `${quiz.question}: `)
                .then(a => {
                    if(a.toLowerCase().trim()=== quiz.answer.toLowerCase().trim()){
                        log('Su respuesta es correcta.');
                        biglog('Correcta', 'green');
                    }
                    else{
                        log('Su respuesta es incorrecta.');
                        biglog('Incorrecta', 'red');
                    }
                    rl.prompt();
                    });
                });

};




exports.playCmd = rl => {
    let score = 0;

    let toBeResolved = [];
    //let quizzes=model.getAll();

    //for (let i=0; i<quizzes.length ; i++){
      //  toBeResolved.push(i);
    //}


    const playOne = () =>{
        return Promise.resolve()
            .then(() => {
        if (toBeResolved.length == 0){
            log("No hay más preguntas.");
            log("Fin del examen. Aciertos:");
            biglog(score, "magenta");
            rl.prompt();
        }


            let id_random = Math.floor(Math.random() * toBeResolved.length);
            let quiz = toBeResolved[id_random];
            toBeResolved.splice(id_random, 1);

            return makeQuestion(rl, quiz.question)

                .then(answer => {
                    respuesta = answer.toLowerCase().trim();
                    respuesta2 = quiz.answer.toLowerCase().trim();
                    if (respuesta === respuesta2) {
                        score++;
                        biglog("Correcto", 'green');
                        log(`CORRECTO - Lleva ${score} aciertos.`);
                        playOne();
                    } else {
                        log("INCORRECTO.");
                        biglog("Incorrecto", 'red');
                        log("Fin del examen. Aciertos:");
                        biglog(score, "magenta");
                    }
                })
        })
    }
    models.quiz.findAll({raw: true})
        .then(quizzes =>{
            toBeResolved=quizzes;
        })
        .then(()=>{
            return playOne();
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(()=>{
            console.log(score);
            rl.prompt();
        })

};


exports.creditsCmd= rl => {
    log('Autores de la práctica:');
    log('Ana de la Iglesia','green');
    log('Adrián Simón','green');
    rl.prompt();

}
exports.quitCmd= rl => {
    biglog("¡Adiós!", 'magenta');
    rl.close();

}