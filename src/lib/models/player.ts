import type { BattleLog } from "./battle";

enum EffectUnit {
    Number = "Number",
    Percent = "Percent"
}

enum EffectFor {
    Player = "Player",
    Enemy = "Enemy"
}

enum ItemType {
    Weapon = "Weapon",
    Badge = "Badge",
    Misc = "Misc"
}

enum EffectType {
    Decrease = "Decrease",
    Increase = "Increase",
}

class ItemSkillEffect {
    public name: string = "";
    public description: string = "";
    public value: number = 0;
    public unit: EffectUnit = EffectUnit.Number;
    public for: EffectFor = EffectFor.Player;
    public type: EffectType = EffectType.Increase;
    public attrTarget: string = 'atk';
    

    constructor(
        attributes?: { name: string, description: string, value: number, unit: EffectUnit, for: EffectFor, type: EffectType, attrTarget: string, bonusEffects?: BonusItemEffect[]}
    ) {
        if (attributes) {
            this.name = attributes.name;
            this.description = attributes.description;
            this.value = attributes.value;
            this.unit = attributes.unit;
            this.for = attributes.for;
            this.type = attributes.type;
            this.attrTarget = attributes.attrTarget;
           
        }
    }

    //from json
    public static fromJson(json: string): ItemSkillEffect {
       
        const obj = JSON.parse(json);
        const ne = new ItemSkillEffect({
            name: obj.name,
            description: obj.description,
            value: obj.value,
            unit: EffectUnit[obj.unit as keyof typeof EffectUnit],
            for: EffectFor[obj.for as keyof typeof EffectFor],
            type: EffectType[obj.type as keyof typeof EffectType],
            attrTarget: obj.attrTarget
        });
        return ne;
    }

    //to json
    public toJson(): string {
        return JSON.stringify({
            name: this.name,
            description: this.description,
            value: this.value,
            unit: this.unit,
            for: this.for,
            type: this.type,
            attrTarget: this.attrTarget
        })
    }
}

class UltimateRequire {
    public skillLanguage: string = "";
    public skillLanguageAmmount: number = 0;

    constructor(
        attributes?: { skillLanguage: string, skillLanguageAmmount: number }
    ) {
        if (attributes) {
            this.skillLanguage = attributes.skillLanguage;
            this.skillLanguageAmmount = attributes.skillLanguageAmmount;
        }
    }

    //from json
    public static fromJson(json: string): UltimateRequire {
        const obj = JSON.parse(json);
        return new UltimateRequire({
            skillLanguage: obj.skillLanguage,
            skillLanguageAmmount: obj.skillLanguageAmmount
        });
    }
}

class ItemSkill {
    public id: string = '';
    public name: string = "";
    public description: string = "";
    public effects: ItemSkillEffect[] = []
    public itemName?: string = "";
    public itemColor?: string = "";

    public doAttack: boolean = true;
    public cooldownRound: number = 0;
    public currentCooldown: number = 0;
    public baseDamage: number = 0;
    public itemSlot?: number = 0;
    public animation?: string = '';
    public isUltimate: boolean = false;
    public ultimateDamage?: number = 0;
    public ultimateAnimation?: string = '';
    public ultimateRequires?: UltimateRequire[];
    

    constructor(
        attributes?: { id: string, name: string, description: string, effects?: ItemSkillEffect[], doAttack?: boolean, cooldownRound?: number, animation?: string, currentCooldown?: number, baseDamage?: number, isUltimate?: boolean, ultimateDamage?: number, ultimateAnimation?: string, ultimateRequires?: UltimateRequire[] }
    ) {
        if (attributes) {
            
            this.id = attributes.id;
            this.name = attributes.name;
            this.description = attributes.description;
            this.effects = attributes.effects || [];
            this.doAttack = attributes.doAttack || false;
            this.cooldownRound = attributes.cooldownRound || 0;
            this.animation = attributes.animation;
            this.currentCooldown = attributes.currentCooldown || 0;
            this.baseDamage = attributes.baseDamage || 0;
            this.isUltimate = attributes.isUltimate || false;
            this.ultimateDamage = attributes.ultimateDamage;
            this.ultimateAnimation = attributes.ultimateAnimation;
            this.ultimateRequires = attributes.ultimateRequires;
        }
    }

    //from json
    public static fromJson(json: string): ItemSkill {
        const obj = JSON.parse(json);
        const ni = new ItemSkill({
            id: obj.id,
            name: obj.name,
            description: obj.description,
            doAttack: obj.doAttack,
            cooldownRound: obj.cooldownRound || 0,
            animation: obj.animation,
            currentCooldown: obj.currentCooldown || 0,
            baseDamage: obj.baseDamage || 0,
            isUltimate: obj.isUltimate || false,
            ultimateDamage: obj.ultimateDamage,
            ultimateAnimation: obj.ultimateAnimation
        });

        if (obj.effects) {
            obj.effects.forEach((effect: any) => {
                ni.effects.push(ItemSkillEffect.fromJson(JSON.stringify(effect)));
            });
        }

        if (obj.ultimateRequires) {
            ni.ultimateRequires = obj.ultimateRequires.map((require: any) => UltimateRequire.fromJson(JSON.stringify(require)));
        }
        return ni;
    }

    //to json
    public toJson(): string {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            description: this.description,
            doAttack: this.doAttack,
            cooldownRound: this.cooldownRound,
            animation: this.animation,
            currentCooldown: this.currentCooldown,
            effects: this.effects.map((effect: ItemSkillEffect) => JSON.parse(effect.toJson()))
        })
    }

    public canDoUltimate(logs: BattleLog[]):boolean {
        if(this.isUltimate){
            if(this.ultimateRequires){
                for (let index = 0; index < this.ultimateRequires.length; index++) {
                    const require = this.ultimateRequires[index];
                    let count = 0;
                    for (let i = 0; i < logs.length; i++) {
                        const log = logs[i];
                        if(log.skill?.id.includes(require.skillLanguage)){
                            count++;
                        }
                        if(log.skill?.id.includes(this.id)){
                            count = 0;
                        }
                    }
                    if(count < require.skillLanguageAmmount){
                        return false;
                    }
                }
                return true;
            }
        }

        return false;
    }
    
}

class BonusItemEffect {
    public sameItem: number = 2;
    public bonus: number = 0;

    constructor(sameItem: number, bonus: number) {
        this.sameItem = sameItem;
        this.bonus = bonus;
    }

    //from json
    public static fromJson(json: string): BonusItemEffect {
        const obj = JSON.parse(json);
        return new BonusItemEffect(obj.sameItem, obj.bonus);
    }

    //to json
    public toJson(): string {
        return JSON.stringify({
            sameItem: this.sameItem,
            bonus: this.bonus
        })
    }
}

class ItemEffect {
    public name: string = "";
    public description: string = "";
    public value: number = 0;
    public unit: EffectUnit = EffectUnit.Number;
    public for: EffectFor = EffectFor.Player;
    public type: EffectType = EffectType.Increase;
    public attrTarget: string = 'atk';
    public bonusEffects: BonusItemEffect[] = [];

    constructor(
        attributes?: { name: string, description: string, value: number, unit: EffectUnit, for: EffectFor, type: EffectType, attrTarget: string, bonusEffects?: BonusItemEffect[] }
    ) {
        if (attributes) {
            this.name = attributes.name;
            this.description = attributes.description;
            this.value = attributes.value;
            this.unit = attributes.unit;
            this.for = attributes.for;
            this.type = attributes.type;
            this.attrTarget = attributes.attrTarget;
            this.bonusEffects = attributes.bonusEffects || [];
        }
    }

    //from json
    public static fromJson(json: string): ItemEffect {
        const obj = JSON.parse(json);
        const ne = new ItemEffect({
            name: obj.name,
            description: obj.description,
            value: obj.value,
            unit: EffectUnit[obj.unit as keyof typeof EffectUnit],
            for: EffectFor[obj.for as keyof typeof EffectFor],
            type: EffectType[obj.type as keyof typeof EffectType],
            attrTarget: obj.attrTarget,
        });

        if (obj.bonusEffects) {
            obj.bonusEffects.forEach((bonus: any) => {
                ne.bonusEffects.push(BonusItemEffect.fromJson(JSON.stringify(bonus)));
            });
        }

        return ne;
    }

    //to json
    public toJson(): string {
        return JSON.stringify({
            name: this.name,
            description: this.description,
            value: this.value,
            unit: this.unit,
            for: this.for,
            type: this.type,
            attrTarget: this.attrTarget,
            bonusEffects: this.bonusEffects.map((bonus: BonusItemEffect) => JSON.parse(bonus.toJson()))
        })
    }
    
}

class Item {
    public id: string = '';
    public name: string = '';
    public description: string = '';
    public quantity: number = 1;
    public type: ItemType = ItemType.Weapon;
    public effects: ItemEffect[] = []
    public color?: string = '';
    public exp: number = 0;
    public skills: ItemSkill[] = [];

    constructor(
        attributes?: { id: string, name: string, description: string, quantity: number, type?: ItemType, effects?: ItemEffect[], color?: string, exp?: number }
    ) {
        if (attributes) {
            this.id = attributes.id.toLowerCase().replace(' ', '-');
            this.name = attributes.name;
            this.description = attributes.description;
            this.quantity = attributes.quantity;
            this.type = attributes.type || ItemType.Weapon;
            this.effects = attributes.effects || [];
            this.color = attributes.color || '';
            this.exp = attributes.exp || 0;
        }
    }

    //from json
    public static fromJson(json: string): Item {
        const obj = JSON.parse(json);
        const ni = new Item({
            id: obj.id,
            name: obj.name,
            description: obj.description,
            quantity: obj.quantity,
            type: ItemType[obj.type as keyof typeof ItemType],
            color: obj.color,
            exp: obj.exp || 0
        });

        if (obj.effects) {
            obj.effects.forEach((effect: any) => {
                ni.effects.push(ItemEffect.fromJson(JSON.stringify(effect)));
            });
        }

        if (obj.skills) {
            obj.skills.forEach((skill: any) => {
                ni.skills.push(ItemSkill.fromJson(JSON.stringify(skill)));
            });
        }

        return ni;
    }

    public currentItemEffect(effect: ItemEffect){
        const itemLevel = this.currentLevel();
        let result = 0;
        if(effect.unit == EffectUnit.Percent){
            result = effect.value * Math.pow(1+0.03,itemLevel-1);
        } else {
            result = effect.value + (itemLevel*itemLevel) * 0.3;
        }
        return Math.round(result);
       
    }

    public currentItemSkillEffect(effect: ItemSkillEffect){
        const itemLevel = this.currentLevel();

        let result = 0;
        if(effect.unit == EffectUnit.Percent){
            result = effect.value * Math.pow(1+0.03,itemLevel-1);
        } else {
            result = effect.value + (itemLevel*itemLevel) * 0.5;
        }
        return Math.round(result);
    }

    public currentItemSkillDamage(skill: ItemSkill){
        const itemLevel = this.currentLevel();
        return Math.round(skill.baseDamage + (itemLevel*itemLevel) * 0.2) + Math.round((skill.ultimateDamage || 0) + (itemLevel*itemLevel) * 0.2)
       
    }

    public currentLevel(){
        let baseXP = 500000;
        let level = 1;
        while (this.exp >= baseXP * level * (1 + level / baseXP)) {
            level++;
        }
        return level;
    }

    public nextExp(){
        let baseXP = 500000;
        let level = this.currentLevel();
        return baseXP * level * (1 + level / baseXP);
    }

    //to json
    public toJson(): string {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            description: this.description,
            quantity: this.quantity,
            type: this.type,
            color: this.color,
            exp: this.exp,
            effects: this.effects.map((effect: ItemEffect) => JSON.parse(effect.toJson())),
            skills: this.skills.map((skill: ItemSkill) => JSON.parse(skill.toJson()))
        })
    }
}

class Tag {
    public name: string = "";
    public color: string = "";

    constructor(attributes?:{
        name:string, color?:string
    }){
        if(attributes != null){
            this.name = attributes.name;
            this.color = attributes.color || "";
        }
    }

    //from json
    public static fromJson(json: string): Tag {
        const obj = JSON.parse(json);
        return new Tag({
            name: obj.name,
            color: obj.color
        });
    }
}

class Player {
    //profile
    public id?: string | undefined | null = '';
    public name?: string | undefined | null = '';
    public email?: string | undefined | null= '';

    //stats
    public hp: number = 0;
    public attack: number = 0;
    public defense: number = 0;
    public speed: number = 0;
    public strength: number = 0;
    public exp: number = 0;

    public items: Item[] = [];

    public bonusAttributes : { hp: number, atk: number, def: number, spd: number,str: number } = { hp: 0, atk: 0, def: 0, spd: 0, str: 0 };

    public slots: (string | null)[] = [null,null,null,null,null,null];
    public skillSlots: (string | null)[] = [null,null,null,null,null,null,null,null,null,null,null,null];

    //battle
    public currentHP: number = 0;

    public score: number = 0;

    public tags: Tag[] = []

    public characterColor : {
        helmetTipColor: string,
        helmetColor: string,
        visorColor: string,
        swordColor: string,
        handColor: string,
        rightFootColor: string,
        leftFootColor: string,
        shieldColor: string,
        bodyColor: string,
        skinColor: string
    } = {
        helmetTipColor: "#d9d9d9",
        helmetColor: "#d9d9d9",
        visorColor: "#d9d9d9",
        swordColor: "#d9d9d9",
        handColor: "#d9d9d9",
        rightFootColor: "#d9d9d9",
        leftFootColor: "#d9d9d9",
        shieldColor: "#d9d9d9",
        bodyColor: "#d9d9d9",
        skinColor: "#ecc8b6"
    } 

    constructor(
        attributes?: { hp: number, atk: number, def: number, spd: number, str: number,  exp?: number,profile?: {
            id?: string,
            name?: string,
            email?: string,
        },
        items?: Item[],
        bonusAttributes?: { hp: number, atk: number, def: number, spd: number, str: number },
        slots?: string[],
        skillSlots?: string[],
        currentHP?: number,
        score?: number,
        tags?: Tag[],
        characterColor?: any
    },
        
    ) {
        if(attributes){
            this.hp = attributes.hp;
            this.attack = attributes.atk;
            this.defense = attributes.def;
            this.speed = attributes.spd;
            this.strength = attributes.str;
            this.exp = attributes.exp || 0;

            this.id = attributes.profile?.id;
            this.name = attributes.profile?.name;
            this.email = attributes.profile?.email;

            if(attributes.items){
                this.items = attributes.items;
            }

            if(attributes.bonusAttributes){
                this.bonusAttributes = attributes.bonusAttributes;
            }

            if(attributes.slots){
                this.slots = attributes.slots;
            }

            if(attributes.skillSlots){
                this.skillSlots = attributes.skillSlots;
            }

            if(attributes.currentHP){
                this.currentHP = attributes.currentHP;
            }

            if(attributes.score){
                this.score = attributes.score;
            }

            if(attributes.tags){
                this.tags = attributes.tags;
            }

            if(attributes.characterColor){
                this.characterColor = attributes.characterColor;
            }
        }

       
    }

    //to json
    public toJson(): string {
        return JSON.stringify(this);
    }

    //from json
    public static fromJson(json: string): Player {
        const obj = JSON.parse(json);
        const np = new Player({
            hp: obj.hp,
            atk: obj.attack,
            def: obj.defense,
            spd: obj.speed,
            str: obj.strength,
            exp: obj.exp,
            profile: {
                id: obj.id || '',
                name: obj.name,
                email: obj.email
            },
            score: obj.score || 0
            
        });
        if(obj.items){
            obj.items.forEach((item: any) => {
                np.items.push(Item.fromJson(JSON.stringify(item)));
            });
        }

        if(obj.bonusAttributes){
            np.bonusAttributes = obj.bonusAttributes;
        }

        if(obj.slots){
            np.slots = obj.slots;
        }

        if(obj.skillSlots){
            np.skillSlots = obj.skillSlots;
        }

        if(obj.currentHP){
            np.currentHP = obj.currentHP;
        }

        if(obj.tags){
            np.tags = obj.tags.map((tag: any) => Tag.fromJson(JSON.stringify(tag)));
        }

        if(obj.characterColor){
            np.characterColor = obj.characterColor;
        }

        return np;
    }

    public currentLevel(){
        let baseXP = 100;
        let level = 1;
        //level formula baseXP * level * (1+level/10)
        while (this.exp >= Math.round(baseXP * level * (1 + level / 10))) {
            level++;
        }
        return level;
    }

    public nextExp(){
        let baseXP = 100;
        let level = this.currentLevel();
        return Math.round(baseXP * level * (1 + level / 10));
    }

    // public currentExp(){
    //     let baseXP = 100;
    //     let level = this.currentLevel();
    //     return baseXP * level * (1 + level / 10);
    // }

    public getItem(itemId: string){
        return this.items.find((item: any) => item.id == itemId);
    }

    public getAttr(attr: string){
        switch (attr) {
            case 'hp':
                return this.hp;
            case 'atk':
                return this.attack;
            case 'def':
                return this.defense;
            case 'spd':
                return this.speed;
            case 'str':
                return this.strength;
           
            default:
                return 0;
        }
    }

    public setAttr(attr: string, value: number){
        switch (attr) {
            case 'hp':
                this.hp = value;
                break;
            case 'atk':
                this.attack = value;
                break;
            case 'def':
                this.defense = value;
                break;
            case 'spd':
                this.speed = value;
                break;
            case 'str':
                this.strength = value;
                break;
            default:
                break;
        }
    }

    public getBonusAttr(attr: string){
        switch (attr) {
            case 'hp':
                return this.bonusAttributes.hp;
            case 'atk':
                return this.bonusAttributes.atk;
            case 'def':
                return this.bonusAttributes.def;
            case 'spd':
                return this.bonusAttributes.spd;
            case 'str':
                return this.bonusAttributes.str;
           
            default:
                return 0;
        }
    }

    public setBonusAttr(attr: string, value: number){
        switch (attr) {
            case 'hp':
                this.bonusAttributes.hp = value;
                break;
            case 'atk':
                this.bonusAttributes.atk = value;
                break;
            case 'def':
                this.bonusAttributes.def = value;
                break;
            case 'spd':
                this.bonusAttributes.spd = value;
                break;
            case 'str':
                this.bonusAttributes.str = value;
                break;
            default:
                break;
        }
    }

    public countSameItemInSlot(itemId: string){
        let count = 0;
        for (let index = 0; index < this.slots.length; index++) {
            const slot = this.slots[index];
            if(slot == itemId){
                count++;
            }
        }
        return count;
    }

    public getEquipedEffect(attr: string) {
        let val:number = 0;
        let bonusnya:any = {};
        for (let index = 0; index < this.slots.length; index++) {
            const slot = this.slots[index];
            if (slot === null) continue;
            const item = this.items.find(
                (it: any) => it.id == slot,
            );
            if(item == undefined){
                continue;
            }
            const effect = item.effects.find(
                (effect: any) => effect.attrTarget == attr,
            );
            if (effect) {
                if (effect.for == "Player") {
                    

                    if(effect.bonusEffects){
                        effect.bonusEffects.forEach((bonus: any, index: number) => {
                            if(this.countSameItemInSlot(item.id) >= bonus.sameItem){
                                if (effect.unit == "Percent") {
                                    if (effect.type == "Increase") {
                                        bonusnya[item.id] =
                                            (this.getAttr(attr) * bonus.bonus) / 100;
                                    } else {
                                        bonusnya[item.id] =-
                                            (this.getAttr(attr) * bonus.bonus) / 100;
                                    }
                                } else {
                                    if (effect.type == "Increase") {
                                        bonusnya[item.id] = bonus.bonus;
                                    } else {
                                        bonusnya[item.id] =-bonus.bonus;
                                    }
                                }
                            }
                        });
                    }
                    let nilaiBonus:number = item.currentItemEffect(effect);
                    if (effect.unit == "Percent") {
                        if (effect.type == "Increase") {
                            val +=
                                (this.getAttr(attr) * nilaiBonus) / 100;
                        } else {
                            val -=
                                (this.getAttr(attr) * nilaiBonus) / 100;
                        }
                    } else {
                        if (effect.type == "Increase") {
                            val += nilaiBonus;
                        } else {
                            val -= nilaiBonus;
                        }
                    }
                }
            }
        }

        for (const b in bonusnya) {
            if (Object.prototype.hasOwnProperty.call(bonusnya, b)) {
                const bonus = bonusnya[b];
                val += bonus;
                
            }
        }

        return Math.round(val);
    }

    public applyEquipedEffect() {
        this.bonusAttributes.hp = this.getEquipedEffect("hp") + (this.getEquipedEffect("def") * 2);
        this.bonusAttributes.str = this.getEquipedEffect("str");
        this.bonusAttributes.atk = this.getEquipedEffect("atk") + (this.getEquipedEffect("str") * 2);
        this.bonusAttributes.spd = this.getEquipedEffect("spd");
        this.bonusAttributes.def = this.getEquipedEffect("def");

    }

    public equipRandomItems(){
        for (let index = 0; index < this.slots.length; index++) {
            const slot = this.slots[index];
            if(slot == null){
                const randomItem = this.items[Math.floor(Math.random() * this.items.length)];
                this.slots[index] = randomItem.id;
            }
        }
    }

    public equipRandomSkills(skills:any){
        let availableSkills: ItemSkill[] = [];
        let _skill: ItemSkill[] = [];
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            const item = this.items.find((it: any) => it.id == slot);
            //find skills with id = slot
            const itemSkill = skills.sort(function(a:ItemSkill,b:ItemSkill){
                //sort by doAttack true first
                if(a.doAttack && !b.doAttack){
                    return -1;
                }
                if(!a.doAttack && b.doAttack){
                    return 1;
                }
                return 0;

            }).find((it: any) => it.id == slot);

            if (item && itemSkill) {
                _skill.push(
                    ...itemSkill.skills.map((s: any) => {
                        const a = ItemSkill.fromJson(JSON.stringify(s));
                        a.id = `${i}_${item.id}_${a.id}`;
                        a.itemName = item?.name;
                        a.itemColor = item?.color;
                        return a;
                    }),
                );
            }
        }
        availableSkills = _skill;
        for (let index = 0; index < this.skillSlots.length; index++) {
            const slot = this.skillSlots[index];
            if(slot == null){
                let randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                if(randomSkill){
                    while (this.skillSlots.includes(randomSkill.id)) {
                        randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                        if(randomSkill){
                            randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                            break;
                        }
                    }
                    if(randomSkill){
                        this.skillSlots[index] = randomSkill.id;
                    }
                }
            }
        }
    }

    public getSkill(skills:any, itemId: string){
        let availableSkills: ItemSkill[] = [];
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            const item = this.items.find((it: any) => it.id == slot);
            //find skills with id = slot
            const itemSkill = skills.find((it: any) => it.id == slot);

            if (item && itemSkill) {
                availableSkills.push(
                    ...itemSkill.skills.map((s: any) => {
                        const a = ItemSkill.fromJson(JSON.stringify(s));
                        a.id = `${i}_${item.id}_${a.id}`;
                        a.itemName = item?.name;
                        a.itemColor = item?.color;
                        return a;
                    }),
                );
            }
        }
        return availableSkills.find((skill: any) => skill.id == itemId);
    }

    public getEquipedItems():Item[]{
        return this.items.filter((item: any) => this.slots.includes(item.id));
    }

    public getEquipedSkills(skills:any):ItemSkill[]{
        let availableSkills: ItemSkill[] = [];
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            const item = this.items.find((it: any) => it.id == slot);
            //find skills with id = slot
            const itemSkill = skills.find((it: any) => it.id == slot);

            if (item && itemSkill) {
                availableSkills.push(
                    ...itemSkill.skills.map((s: any) => {
                        const a = ItemSkill.fromJson(JSON.stringify(s));
                        a.id = `${i}_${item.id}_${a.id}`;
                        a.itemName = item?.name;
                        a.itemColor = item?.color;
                        return a;
                    }),
                );
            }
        }
        return availableSkills.filter((skill: any) => this.skillSlots.includes(skill.id));
    }

    public setFillColor(elms: any, color: any) {
        for (let i = 0; i < elms.length; i++) {
            const element = elms[i];
            element?.setAttribute("fill", color);
        }
    }

  
    public selectSkinColor(playerContainer:HTMLElement,e: any) {
        const paths = playerContainer.children[4]?.children[0].querySelectorAll("path");
        this.setFillColor(paths, e.target?.value ?? e);
    }

    public selectHelmetColor(playerContainer:HTMLElement,e: any) {
        const paths =
            playerContainer.children[4]?.children[1].children[0].querySelectorAll(
                "path",
            );
        this.setFillColor(paths, e.target?.value ?? e);
    }

    public selectHelmetTipColor(playerContainer:HTMLElement,e: any) {
        const paths =
            playerContainer.children[4]?.children[1].children[1].querySelectorAll(
                "path",
            );
        this.setFillColor(paths, e.target?.value ?? e);
    }

    public selectVisorColor(playerContainer:HTMLElement,e: any) {
        const visorPaths =
            playerContainer.children[4]?.children[2].querySelectorAll("path");
        this.setFillColor(visorPaths, e.target?.value ?? e);
    }

    public selectSwordColor(playerContainer:HTMLElement,e: any) {
        const swordPaths =
            playerContainer.children[3]?.children[1].querySelectorAll("path");
            this.setFillColor(swordPaths, e.target?.value ?? e);
    }

    public seletcHandColor(playerContainer:HTMLElement,e: any) {
        const handPaths =
            playerContainer.children[3]?.children[0].querySelectorAll("path");
            this.setFillColor(handPaths, e.target?.value ?? e);
    }

    public seletcRightFootColor(playerContainer:HTMLElement,e: any) {
        const rightFootPaths = playerContainer.children[1]?.querySelectorAll("g path");
        this.setFillColor(rightFootPaths, e.target?.value ?? e);
    }

    public seletcLeftFootColor(playerContainer:HTMLElement,e: any) {
        const leftFootPaths = playerContainer.children[2]?.querySelectorAll("g path");
        this.setFillColor(leftFootPaths, e.target?.value ?? e);
    }

    public seletcShieldColor(playerContainer:HTMLElement,e: any) {
        const shieldPaths = playerContainer.children[5]?.querySelectorAll("g path");
        this.setFillColor(shieldPaths, e.target?.value ?? e);
    }

    public seletcBodydColor(playerContainer:HTMLElement,e: any) {
        const bodyPaths = playerContainer.children[0]?.querySelectorAll("g path");
        this.setFillColor(bodyPaths, e.target?.value ?? e);
    }

}

//export class
export { Player, Item, ItemEffect, ItemType, EffectUnit, ItemSkill,ItemSkillEffect, EffectFor,EffectType,Tag };