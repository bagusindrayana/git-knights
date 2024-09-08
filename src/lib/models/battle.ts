import { Item, ItemSkill } from "./player";

class BasePlayer {
    public playerId: string = "";
    public currentHp: number = 0;
    public hp: number = 0;
    public attack: number = 0;
    public defense: number = 0;
    public speed: number = 0;
    public strength: number = 0;
    public originalStats: {
        hp: number,
        attack: number,
        defense: number,
        speed: number,
        strength: number
    } = {
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        strength: 0
    }
    public exp: number = 0;
    public items: Item[] = [];
    public skills: ItemSkill[] = [];

    //constructor
    constructor(args?: { playerId: string, currentHp: number, hp: number, attack: number, defense: number, speed: number, strength: number, originalStats: { hp: number, attack: number, defense: number, speed: number, strength: number }, exp: number, items: Item[], skills: ItemSkill[] }) {
        if (args) {
            this.playerId = args.playerId;
            this.currentHp = args.currentHp;
            this.hp = args.hp;
            this.attack = args.attack;
            this.defense = args.defense;
            this.speed = args.speed;
            this.strength = args.strength;
            this.originalStats = args.originalStats;
            this.exp = args.exp;
            this.items = args.items;
            this.skills = args.skills;
        }
    }

    //from json
    static fromJson(json: string): BasePlayer {
        const data = JSON.parse(json);
        const newPlayer = new BasePlayer({
            playerId: data.playerId,
            currentHp: data.currentHp,
            hp: data.hp,
            attack: data.attack,
            defense: data.defense,
            speed: data.speed,
            strength: data.strength,
            originalStats: data.originalStats,
            exp: data.exp,
            items: data.items.map((item: any) => Item.fromJson(JSON.stringify(item))),
            skills: data.skills.map((skill: any) => ItemSkill.fromJson(JSON.stringify(skill)))
        });

        return newPlayer;
    }


    //to json
    toJson(): string {
        return JSON.stringify({
            playerId: this.playerId,
            currentHp: this.currentHp,
            hp: this.hp,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            strength: this.strength,
            originalStats: this.originalStats,
            exp: this.exp,
            items: this.items.map((item: Item) => item.toJson()),
            skills: this.skills.map((skill: ItemSkill) => skill.toJson())
        });
    }
}
class Attacker extends BasePlayer {

}

class Defender extends BasePlayer{
    
}

class BattleLog {
    public round: number = 0;
    public from: string = "";
    public to: string = "";
    public skill?: ItemSkill;
    public damage: number = 0;
    public isCriticalHit: boolean = false;
    public description: string = "";

    //constructor
    constructor(args?: { round: number, from: string, to: string, damage: number, isCriticalHit: boolean, description: string,skill?: ItemSkill }) {
        if (args) {
            this.round = args.round;
            this.from = args.from;
            this.to = args.to;
            this.skill = args.skill;
            this.damage = args.damage;
            this.isCriticalHit = args.isCriticalHit;
            this.description = args.description;
        }
    }


    //from json
    static fromJson(json: string): BattleLog {
        const data = JSON.parse(json);
        const newBattleLog = new BattleLog({
            round: data.round,
            from: data.from,
            to: data.to,
            damage: data.damage,
            isCriticalHit: data.isCriticalHit,
            description: data.description
        });

        if(data.skill != undefined){
            newBattleLog.skill = ItemSkill.fromJson(JSON.stringify(data.skill));
        }

        return newBattleLog;
    }
    
}

class Battle {
    public id: string = "";
    public attacker: Attacker = new Attacker();
    public defender: Defender = new Defender();
    public battleLog: BattleLog[] = [];
    public status: string = "pending";
    public timestamp: number = Date.now();
    public round: number = 1;

    //constructor
    constructor(args?: { id: string, attacker: Attacker, defender: Defender, battleLog: BattleLog[], timestamp?: number, round?: number, status?: string }) {
        if (args) {
            this.id = args.id;
            this.attacker = args.attacker;
            this.defender = args.defender;
            this.battleLog = args.battleLog;
            this.timestamp = args.timestamp || Date.now();
            this.round = args.round || 1;
            this.status = args.status || "pending";
        }
    }

    //from json
    static fromJson(json: string): Battle {
        const data = JSON.parse(json);
        const newBattle = new Battle({
            id: data.id,
            attacker: Attacker.fromJson(JSON.stringify(data.attacker)),
            defender: Defender.fromJson(JSON.stringify(data.defender)),
            battleLog: data.battleLog.map((log: any) => BattleLog.fromJson(JSON.stringify(log))),
            timestamp: data.timestamp,
            round: data.round,
            status: data.status
        });

        return newBattle;
    }
    
    //to json
    toJson(): string {
        return JSON.stringify({
            id: this.id,
            attacker: this.attacker,
            defender: this.defender,
            battleLog: this.battleLog,
            timestamp: this.timestamp
        });
    }
}

export { Battle, BattleLog, Attacker, Defender, BasePlayer };