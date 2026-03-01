#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// BASE COMMAND CLASS (OOP Pattern)
// ============================================================
abstract class BaseCommand {
    protected name: string;
    protected description: string;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    abstract execute(...args: any[]): Promise<void> | void;

    protected logSuccess(message: string): void {
        console.log(chalk.green('✓ ') + message);
    }

    protected logError(message: string): void {
        console.log(chalk.red('✗ ') + message);
    }

    protected logInfo(message: string): void {
        console.log(chalk.blue('ℹ ') + message);
    }

    protected logWarning(message: string): void {
        console.log(chalk.yellow('⚠ ') + message);
    }
}

// ============================================================
// VALIDATOR CLASS (OOP Pattern)
// ============================================================
class Validator {
    static isValidNumber(value: string): boolean {
        return !isNaN(parseFloat(value));
    }

    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }
}

// ============================================================
// API SERVICE CLASS (OOP Pattern)
// ============================================================
class ApiService {
    async fetchData(url: string): Promise<any> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`API request failed: ${error}`);
        }
    }
}

// ============================================================
// COMMAND IMPLEMENTATIONS
// ============================================================

// 1. Greet Command
class GreetCommand extends BaseCommand {
    constructor() {
        super('greet', 'Greet a user by name');
    }

    execute(name: string, options: any): void {
        const greeting = options.formal
            ? `Good day, ${name}!`
            : `Hey ${name}! 👋`;
        this.logSuccess(greeting);
    }
}

// 2. File Info Command
class FileInfoCommand extends BaseCommand {
    constructor() {
        super('fileinfo', 'Display information about a file');
    }

    execute(filename: string): void {
        if (!Validator.fileExists(filename)) {
            this.logError(`File not found: ${filename}`);
            return;
        }

        const stats = fs.statSync(filename);
        const fileInfo = {
            name: path.basename(filename),
            path: path.resolve(filename),
            size: `${(stats.size / 1024).toFixed(2)} KB`,
            created: stats.birthtime.toLocaleString(),
            modified: stats.mtime.toLocaleString(),
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
        };

        console.log(chalk.cyan('\n📄 File Information:'));
        console.log(chalk.yellow('─'.repeat(50)));
        Object.entries(fileInfo).forEach(([key, value]) => {
            console.log(chalk.white(`${key.padEnd(15)}: `) + chalk.green(value));
        });
        console.log(chalk.yellow('─'.repeat(50)) + '\n');
    }
}

// 3. GitHub User Command (API Integration #1)
class GitHubUserCommand extends BaseCommand {
    private apiService: ApiService;

    constructor() {
        super('github-user', 'Fetch GitHub user information');
        this.apiService = new ApiService();
    }

    async execute(username: string): Promise<void> {
        try {
            this.logInfo(`Fetching GitHub user: ${username}...`);
            const data = await this.apiService.fetchData(`https://api.github.com/users/${username}`);

            console.log(chalk.cyan('\n👤 GitHub User Information:'));
            console.log(chalk.yellow('─'.repeat(50)));
            console.log(chalk.white('Name:         ') + chalk.green(data.name || 'N/A'));
            console.log(chalk.white('Username:     ') + chalk.green(data.login));
            console.log(chalk.white('Bio:          ') + chalk.green(data.bio || 'N/A'));
            console.log(chalk.white('Followers:    ') + chalk.green(data.followers));
            console.log(chalk.white('Following:    ') + chalk.green(data.following));
            console.log(chalk.white('Public Repos: ') + chalk.green(data.public_repos));
            console.log(chalk.white('Profile:      ') + chalk.blue(data.html_url));
            console.log(chalk.yellow('─'.repeat(50)) + '\n');
        } catch (error) {
            this.logError(`Failed to fetch GitHub user: ${error}`);
        }
    }
}

// 4. Weather Command (API Integration #2)
class WeatherCommand extends BaseCommand {
    private apiService: ApiService;

    constructor() {
        super('weather', 'Get current weather for a city');
        this.apiService = new ApiService();
    }

    async execute(city: string): Promise<void> {
        try {
            this.logInfo(`Fetching weather for ${city}...`);
            // Using wttr.in API (no API key required)
            const data = await this.apiService.fetchData(`https://wttr.in/${city}?format=j1`);

            const current = data.current_condition[0];
            const weather = {
                location: data.nearest_area[0].areaName[0].value,
                temperature: `${current.temp_C}°C / ${current.temp_F}°F`,
                feels_like: `${current.FeelsLikeC}°C / ${current.FeelsLikeF}°F`,
                condition: current.weatherDesc[0].value,
                humidity: `${current.humidity}%`,
                wind: `${current.windspeedKmph} km/h`,
                precipitation: `${current.precipMM} mm`
            };

            console.log(chalk.cyan('\n🌤️  Weather Information:'));
            console.log(chalk.yellow('─'.repeat(50)));
            Object.entries(weather).forEach(([key, value]) => {
                console.log(chalk.white(`${key.padEnd(15)}: `) + chalk.green(value));
            });
            console.log(chalk.yellow('─'.repeat(50)) + '\n');
        } catch (error) {
            this.logError(`Failed to fetch weather: ${error}`);
        }
    }
}

// 5. Quote Command (API Integration #3)
class QuoteCommand extends BaseCommand {
    private apiService: ApiService;

    constructor() {
        super('quote', 'Get a random inspirational quote');
        this.apiService = new ApiService();
    }

    async execute(): Promise<void> {
        try {
            this.logInfo('Fetching a random quote...');
            const data = await this.apiService.fetchData('https://api.quotable.io/random');

            console.log(chalk.cyan('\n💭 Random Quote:'));
            console.log(chalk.yellow('─'.repeat(50)));
            console.log(chalk.white(`"${data.content}"`));
            console.log(chalk.green(`\n― ${data.author}`));
            console.log(chalk.yellow('─'.repeat(50)) + '\n');
        } catch (error) {
            this.logError(`Failed to fetch quote: ${error}`);
        }
    }
}

// 6. Pokemon Command (API Integration #4)
class PokemonCommand extends BaseCommand {
    private apiService: ApiService;

    constructor() {
        super('pokemon', 'Get Pokemon information');
        this.apiService = new ApiService();
    }

    async execute(name: string): Promise<void> {
        try {
            this.logInfo(`Fetching Pokemon: ${name}...`);
            const data = await this.apiService.fetchData(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);

            const abilities = data.abilities.map((a: any) => a.ability.name).join(', ');
            const types = data.types.map((t: any) => t.type.name).join(', ');

            console.log(chalk.cyan('\n🎮 Pokemon Information:'));
            console.log(chalk.yellow('─'.repeat(50)));
            console.log(chalk.white('Name:         ') + chalk.green(data.name.toUpperCase()));
            console.log(chalk.white('Height:       ') + chalk.green(`${data.height / 10} m`));
            console.log(chalk.white('Weight:       ') + chalk.green(`${data.weight / 10} kg`));
            console.log(chalk.white('Types:        ') + chalk.green(types));
            console.log(chalk.white('Abilities:    ') + chalk.green(abilities));
            console.log(chalk.yellow('─'.repeat(50)) + '\n');
        } catch (error) {
            this.logError(`Failed to fetch Pokemon: ${error}`);
        }
    }
}

// 7. Joke Command (API Integration #5)
class JokeCommand extends BaseCommand {
    private apiService: ApiService;

    constructor() {
        super('joke', 'Get a random joke');
        this.apiService = new ApiService();
    }

    async execute(): Promise<void> {
        try {
            this.logInfo('Fetching a random joke...');
            const data = await this.apiService.fetchData('https://official-joke-api.appspot.com/random_joke');

            console.log(chalk.cyan('\n😄 Random Joke:'));
            console.log(chalk.yellow('─'.repeat(50)));
            console.log(chalk.white(data.setup));
            setTimeout(() => {
                console.log(chalk.green(`\n${data.punchline} 😂`));
                console.log(chalk.yellow('─'.repeat(50)) + '\n');
            }, 1000);
        } catch (error) {
            this.logError(`Failed to fetch joke: ${error}`);
        }
    }
}

// 8. Math Calculator Command
class MathCommand extends BaseCommand {
    constructor() {
        super('math', 'Perform mathematical operations');
    }

    execute(operation: string, num1: string, num2: string): void {
        if (!Validator.isValidNumber(num1) || !Validator.isValidNumber(num2)) {
            this.logError('Invalid numbers provided');
            return;
        }

        const n1 = parseFloat(num1);
        const n2 = parseFloat(num2);
        let result: number;

        switch (operation.toLowerCase()) {
            case 'add':
                result = n1 + n2;
                break;
            case 'subtract':
                result = n1 - n2;
                break;
            case 'multiply':
                result = n1 * n2;
                break;
            case 'divide':
                if (n2 === 0) {
                    this.logError('Division by zero is not allowed');
                    return;
                }
                result = n1 / n2;
                break;
            case 'power':
                result = Math.pow(n1, n2);
                break;
            case 'mod':
                result = n1 % n2;
                break;
            default:
                this.logError(`Unknown operation: ${operation}`);
                return;
        }

        this.logSuccess(`Result: ${n1} ${operation} ${n2} = ${result}`);
    }
}

// 9. Random Number Generator Command
class RandomCommand extends BaseCommand {
    constructor() {
        super('random', 'Generate random numbers');
    }

    execute(min: string, max: string): void {
        if (!Validator.isValidNumber(min) || !Validator.isValidNumber(max)) {
            this.logError('Invalid range provided');
            return;
        }

        const minNum = parseInt(min);
        const maxNum = parseInt(max);

        if (minNum >= maxNum) {
            this.logError('Min value must be less than max value');
            return;
        }

        const random = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        this.logSuccess(`Random number between ${min} and ${max}: ${random}`);
    }
}

// 10. List Files Command
class ListFilesCommand extends BaseCommand {
    constructor() {
        super('list', 'List files in a directory');
    }

    execute(directory: string = '.'): void {
        if (!Validator.fileExists(directory)) {
            this.logError(`Directory not found: ${directory}`);
            return;
        }

        const stats = fs.statSync(directory);
        if (!stats.isDirectory()) {
            this.logError(`${directory} is not a directory`);
            return;
        }

        const files = fs.readdirSync(directory);
        console.log(chalk.cyan(`\n📁 Files in ${path.resolve(directory)}:`));
        console.log(chalk.yellow('─'.repeat(50)));

        files.forEach(file => {
            const filePath = path.join(directory, file);
            const fileStats = fs.statSync(filePath);
            const icon = fileStats.isDirectory() ? '📂' : '📄';
            console.log(chalk.white(`${icon} ${file}`));
        });
        console.log(chalk.yellow('─'.repeat(50)) + '\n');
    }
}

// 11. Dog Facts Command (API Integration #6)
class DogFactCommand extends BaseCommand {
    private apiService: ApiService;

    constructor() {
        super('dogfact', 'Get a random dog fact');
        this.apiService = new ApiService();
    }

    async execute(): Promise<void> {
        try {
            this.logInfo('Fetching a random dog fact...');
            const data = await this.apiService.fetchData('https://dog-api.kinduff.com/api/facts');

            console.log(chalk.cyan('\n🐕 Random Dog Fact:'));
            console.log(chalk.yellow('─'.repeat(50)));
            console.log(chalk.white(data.facts[0]));
            console.log(chalk.yellow('─'.repeat(50)) + '\n');
        } catch (error) {
            this.logError(`Failed to fetch dog fact: ${error}`);
        }
    }
}

// 12. Email Validator Command
class EmailValidatorCommand extends BaseCommand {
    constructor() {
        super('validate-email', 'Validate an email address');
    }

    execute(email: string): void {
        if (Validator.isValidEmail(email)) {
            this.logSuccess(`${email} is a valid email address`);
        } else {
            this.logError(`${email} is NOT a valid email address`);
        }
    }
}

// ============================================================
// CLI APPLICATION CLASS (Main OOP Container)
// ============================================================
class CLIApplication {
    private program: Command;
    private commands: Map<string, BaseCommand>;

    constructor() {
        this.program = new Command();
        this.commands = new Map();
        this.initialize();
    }

    private initialize(): void {
        this.program
            .name('fluffy')
            .description(chalk.cyan(' Fluffy CLI - A powerful command-line tool'))
            .version('2.0.0');

        this.registerCommands();
    }

    private registerCommands(): void {
        // Register all commands
        const greetCmd = new GreetCommand();
        this.program
            .command('greet <name>')
            .description(greetCmd.description)
            .option('-f, --formal', 'Use formal greeting')
            .action((name, options) => greetCmd.execute(name, options));

        const fileInfoCmd = new FileInfoCommand();
        this.program
            .command('fileinfo <filename>')
            .description(fileInfoCmd.description)
            .action((filename) => fileInfoCmd.execute(filename));

        const githubCmd = new GitHubUserCommand();
        this.program
            .command('github-user <username>')
            .description(githubCmd.description)
            .action(async (username) => await githubCmd.execute(username));

        const weatherCmd = new WeatherCommand();
        this.program
            .command('weather <city>')
            .description(weatherCmd.description)
            .action(async (city) => await weatherCmd.execute(city));

        const quoteCmd = new QuoteCommand();
        this.program
            .command('quote')
            .description(quoteCmd.description)
            .action(async () => await quoteCmd.execute());

        const pokemonCmd = new PokemonCommand();
        this.program
            .command('pokemon <name>')
            .description(pokemonCmd.description)
            .action(async (name) => await pokemonCmd.execute(name));

        const jokeCmd = new JokeCommand();
        this.program
            .command('joke')
            .description(jokeCmd.description)
            .action(async () => await jokeCmd.execute());

        const mathCmd = new MathCommand();
        this.program
            .command('math <operation> <num1> <num2>')
            .description(`${mathCmd.description} (add, subtract, multiply, divide, power, mod)`)
            .action((operation, num1, num2) => mathCmd.execute(operation, num1, num2));

        const randomCmd = new RandomCommand();
        this.program
            .command('random <min> <max>')
            .description(randomCmd.description)
            .action((min, max) => randomCmd.execute(min, max));

        const listCmd = new ListFilesCommand();
        this.program
            .command('list [directory]')
            .description(listCmd.description)
            .action((directory) => listCmd.execute(directory));

        const dogFactCmd = new DogFactCommand();
        this.program
            .command('dogfact')
            .description(dogFactCmd.description)
            .action(async () => await dogFactCmd.execute());

        const emailValidatorCmd = new EmailValidatorCommand();
        this.program
            .command('validate-email <email>')
            .description(emailValidatorCmd.description)
            .action((email) => emailValidatorCmd.execute(email));
    }

    public run(): void {
        this.program.parse();
    }
}

// ============================================================
// APPLICATION ENTRY POINT
// ============================================================
const app = new CLIApplication();
app.run();
