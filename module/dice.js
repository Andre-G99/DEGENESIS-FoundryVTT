import RollDialog from "./apps/roll-dialog.js"

export class DegenesisDice
{
    static async rollAction({actionNumber, difficulty = 0, diceModifier = 0, successModifier = 0, triggerModifier = 0}={}, {dsn = true}={}) {
        const [rollResult, roll] = await this.calculateRollResult({
            actionNumber,
            difficulty,
            diceModifier,
            successModifier,
            triggerModifier
        });

        if (game.dice3d && dsn){

            // Temporary DiceSoNice Fix 
            
            let usersArr = []
            let gmArr = []
            let isBlind =false

            let rollMode = game.settings.get("core", "rollMode");

            for (User of game.users ){if (User.isGM == true){gmArr.push(User);}}
    
            switch(rollMode){

                case 'roll':
                    usersArr = null;
                    break;
                case 'selfroll':
                    usersArr.push(game.user);
                    break;
                case 'blindroll':
                    usersArr = gmArr;
                    isBlind=true;               // This will break a blind roll for GM
                    break;
                case 'gmroll':
                    usersArr = gmArr
                    usersArr.push(game.user);
                    break;
            }
            
            await game.dice3d.showForRoll(roll,game.user,true,usersArr,isBlind);}
            
        return rollResult;
    }



    static async calculateRollResult({actionNumber, difficulty = 0, diceModifier = 0, successModifier = 0, triggerModifier = 0}) {
        let rollResult = {}

        let successes;
        let triggers = triggerModifier;
        let ones = 0;
        let result;
        let rolls = [];
        let baseDice = [];
        let vanillaRoll;

        //actionNumber is the number of dice
        actionNumber += diceModifier;


        //reassign actionNumber to 0 if it goes below 0, for initiative's sake
        if(actionNumber < 0){
            actionNumber = 0;
        }

        let autoSuccesses = 0;
        if (actionNumber > 12) {
            autoSuccesses = actionNumber - 12;
            actionNumber = 12;
        }
        
        let roll = new Roll(`${actionNumber}d6cs>3`);
        vanillaRoll = new Roll(`${actionNumber -= diceModifier}d6cs>3`);
        await vanillaRoll.roll();
        await roll.roll();

        baseDice = vanillaRoll.terms[0].results;
        rolls = roll.terms[0].results;
        successes = roll.total + autoSuccesses + successModifier;


        rolls.forEach(r => {
            if (r.result == 6)
                triggers++;
            if (r.result == 1)
                 ones++;
        })
        

        if (difficulty > 0) {
            if (successes >= difficulty) {
                result = "success"
            } else {
                result = "failure"
                if (ones > successes)
                    result = "botch"
            }
        }

        rollResult = {
            successes,
            triggers,
            ones,
            result,
            rolls,
            baseDice
        }

        return [rollResult, roll];
    }

    static async showRollDialog({dialogData, rollData, cardData})
    {
        let html = await renderTemplate("systems/degenesis/templates/apps/roll-dialog.html", dialogData)
        return new Promise((resolve, reject) => {
            new RollDialog({
                content : html,
                title : dialogData.title,
                buttons : {
                    "roll" : {
                        label : "Roll",
                        callback : async (dlg) => {
                            rollData.difficulty = parseInt(dlg.find('[name="difficulty"]').val() || 0)
                            rollData.diceModifier = parseInt(dlg.find('[name="diceModifier"]').val() || 0)
                            rollData.successModifier = parseInt(dlg.find('[name="successModifier"]').val() || 0)
                            rollData.triggerModifier = parseInt(dlg.find('[name="triggerModifier"]').val() || 0)
                            rollData.secondary = dlg.find(".secondary-select").val()
                            resolve(rollData)
                        }
                    }
                },
                default: "roll",
                dialogData
            }, {classes : ["roll-dialog"]}).render(true)
        })
    }
}
