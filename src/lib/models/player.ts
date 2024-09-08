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
    public itemSlot?: number = 0;
    public animation?: string = '';

    constructor(
        attributes?: { id: string, name: string, description: string, effects?: ItemSkillEffect[], doAttack?: boolean, cooldownRound?: number, animation?: string, currentCooldown?: number }
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
            currentCooldown: obj.currentCooldown || 0
        });

        if (obj.effects) {
            obj.effects.forEach((effect: any) => {
                ni.effects.push(ItemSkillEffect.fromJson(JSON.stringify(effect)));
            });
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
        attributes?: { id: string, name: string, description: string, quantity: number, type?: ItemType, effects?: ItemEffect[], color?: string }
    ) {
        if (attributes) {
            this.id = attributes.id.toLowerCase().replace(' ', '-');
            this.name = attributes.name;
            this.description = attributes.description;
            this.quantity = attributes.quantity;
            this.type = attributes.type || ItemType.Weapon;
            this.effects = attributes.effects || [];
            this.color = attributes.color || '';
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
            color: obj.color
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

    public currentLevel(){
        let baseXP = 1000;
        let level = 1;
        while (this.exp >= baseXP * level * (1 + level / 1000)) {
            level++;
        }
        return level;
    }

    public nextExp(){
        let baseXP = 1000;
        let level = this.currentLevel();
        return baseXP * level * (1 + level / 1000);
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

    constructor(
        attributes?: { hp: number, atk: number, def: number, spd: number, str: number,  exp?: number,profile?: {
            id?: string,
            name?: string,
            email?: string,
        },
        items?: Item[],
        bonusAttributes?: { hp: number, atk: number, def: number, spd: number, str: number },
        slots?: string[]
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
            }
            
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
                    let nilaiBonus:number = effect.value;
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
}

//export class
export { Player, Item, ItemEffect, ItemType, EffectUnit, ItemSkill,ItemSkillEffect, EffectFor,EffectType };