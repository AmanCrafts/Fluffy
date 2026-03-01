#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
program
    .name('fluffy')
    .description('A CLI tool to manage your tasks')
    .version('1.0.0');
program
    .command('say-hello-to <name>')
    .description('Greet a user by name')
    .action(name => {
    console.log(`Hello, ${name}!`);
});
program
    .command('add <num1> <num2>')
    .description('Add two numbers together')
    .action((num1, num2) => {
    console.log(`The sum of ${num1} and ${num2} is ${parseInt(num1) + parseInt(num2)}`);
});
program
    .command('subtract <num1> <num2>')
    .description('Subtract num2 from num1')
    .action((num1, num2) => {
    console.log(`Subtraction ${num2} from ${num1} will give ${parseInt(num1, 10) - parseInt(num2, 10)}`);
});
program
    .command('multiply <num1> <num2>')
    .description('Multiply two numbers')
    .action((num1, num2) => {
    console.log(`Multiplying ${num1} with ${num2} will give ${parseInt(num1, 10) * parseInt(num2, 10)}`);
});
program
    .command('divide <num1> <num2>')
    .description('Divide num1 by num2')
    .action((num1, num2) => {
    if (parseInt(num2) === 0) {
        console.log('Error: Division by zero is not allowed.');
    }
    else {
        console.log(`Dividing ${num1} by ${num2} will give ${parseInt(num1, 10) / parseInt(num2, 10)}`);
    }
});
program
    .command("catch-a-pokemon")
    .description("Fetch a random Pokémon from the PokéAPI")
    .action(async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const pokemon = data.results[randomIndex];
        console.log(`Hurray! You caught a ${pokemon.name}! ${pokemon.name} is a ${pokemon.type} type Pokémon. Its abilities include ${pokemon.abilities.join(', ')}.`);
    }
    catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
});
program.parse();
