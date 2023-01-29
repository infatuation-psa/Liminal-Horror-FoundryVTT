import { findCompendiumItem } from './compendium.js'
import { evaluateFormula } from './utils.js'

export class Damage {

    /**
     * @description Apply damage to several tokens
     * @param {String[]} targets Array of Id of the targeted tokens
     * @param {Number} damage Positive number
     */
    static applyToTargets(targets, damage, stress) {
        targets.forEach(target => {
            const data = this.applyToTarget(target, damage, stress);
            this._showDetails(data);
        });
    }

    /**
     * @description Apply damage to one token
     * @param {*} target Id of one token
     * @param {*} damage Amount of damaage
     * @returns actor + old and new values
     */
    static applyToTarget(target, damage, stress) {
        const tokenDoc = canvas.scene.tokens.get(target);
        // Linked to Actor
        if (tokenDoc.isLinked) {
            const armor = stress ? tokenDoc.actor.system.stability : tokenDoc.actor.system.armor;
            
            const hp = tokenDoc.actor.system.hp.value;
            const stat = stress ? tokenDoc.actor.system.abilities.CTRL.value: tokenDoc.actor.system.abilities.STR.value;

            let {dmg, newHp, newStat} = this._calculateHpAndStats(damage, armor, hp, stat);

            if(stress) {
                tokenDoc.actor.update({'system.hp.value': newHp, 'system.abilities.CTRL.value': newStat});
            } else {
                tokenDoc.actor.update({'system.hp.value': newHp, 'system.abilities.STR.value': newStat});
            }

            const actor = tokenDoc.actor;

            return { actor, dmg, damage, armor, hp, stat, newHp, newStat, stress };
        }
        // Synthetic actor
        else {
            let armor = tokenDoc.actorData?.system?.armor;
            if (armor === undefined) armor = tokenDoc.actor.system.armor;

            let stability = tokenDoc.actorData?.system?.stability;
            if (stability === undefined) armor = tokenDoc.actor.system.stability;

            let hp = tokenDoc.actorData?.system?.hp?.value;
            if (hp === undefined) hp = tokenDoc.actor.system.hp.value; 

            let str = tokenDoc.actorData?.system?.abilities?.STR?.value;
            if (str === undefined) str = tokenDoc.actor.system.abilities.STR.value;

            let ctrl = tokenDoc.actorData?.system?.abilities?.CTRL?.value;
            if (ctrl === undefined) str = tokenDoc.actor.system.abilities.CTRL.value;

            let stat
            if (stress) {
                stat = ctrl
            } else {
                stat = str
            }

            let {dmg, newHp, newStat} = this._calculateHpAndStats(damage, armor, hp, stat);
            
            if(stress) {
                tokenDoc.modifyActorDocument({'system.hp.value': newHp, 'system.abilities.CTRL.value': newStat});
            } else {
                tokenDoc.modifyActorDocument({'system.hp.value': newHp, 'system.abilities.STR.value': newStat});
            }

            const actor = ( tokenDoc.actorData !== undefined ) ? tokenDoc.actorData : tokenDoc.actor

            return { actor, dmg, damage, armor, hp, stat, newHp, newStat, stress };
        }
    }

    /**
     * @description Apply damage to a target token based on the token's id
     * @param {*} event 
     * @param {*} html 
     * @param {*} data 
     */
    static onClickChatMessageApplyButton(event, html, data){
        const btn = $(event.currentTarget);
        const targets = btn.data("targets");

        let targetsList = targets.split(';');

        // Shift Click allow to target the targeted tokens
        if (event.shiftKey) {            
            for (let index = 0; index < targetsList.length; index++) {
                const target = targetsList[index];
                const token = canvas.scene.tokens.get(target).object;
                const releaseOthers = (index == 0 ? (!token.isTargeted ? true : false) : false);
                const targeted = !token.isTargeted;
                token.setTarget(targeted, {releaseOthers: releaseOthers});
            }
        }
        // Apply damage to targets
        else {
            if (targets !== undefined) {
                const dmg = parseInt(html.find(".dice-total").text());
                const stress = html.has(".stress");
                this.applyToTargets(targetsList, dmg, stress);
            }
        }
    }

    /**
     * @description Damage are reduced by armor, then apply to HP, and then to STR if not enough HP
     * @param {*} damage 
     * @param {*} armor 
     * @param {*} hp 
     * @param {*} str 
     * @returns damage done, new HP value and STR value
     */
     static _calculateHpAndStats(damage, armor, hp, stat) {
        let dmg = damage - armor;
        if (dmg < 0) dmg = 0;

        let newHp;
        let newStat = stat;
        if (dmg <= hp) { 
            newHp = hp - dmg;
            if (newHp < 0) newHp = 0;
        }
        else {
            newHp = 0;
            newStat = stat - (dmg - hp);
        }

        return {dmg, newHp, newStat};
    }

    /**
     * Show chat message details of damage done for a token
     * @param data
     * @private
     */
    static _showDetails(data) {

        const { actor, dmg, damage, armor, hp, stat, newHp, newStat, stress } = data

        let content = '<p><strong>' + game.i18n.localize('LIMINAL.Damage') + '</strong>: ' + dmg + ' (' + damage + '-' + armor + ')</p>'
        if (newHp !== hp) {
            content += '<p><strong>' + game.i18n.localize('LIMINAL.HitProtection') + '</strong>: <s>' + hp + '</s> => ' + newHp + '</p>'
        } else {
            content += '<p><strong>' + game.i18n.localize('LIMINAL.HitProtection') + '</strong>: ' + hp + '</p>'
        }
        if (newStat !== stat) {
            if(stress) {
                content += '<p><strong>' + game.i18n.localize('CTRL') + '</strong>: <s>' + stat + '</s> => ' + newStat + '</p>'
            } else {
                content += '<p><strong>' + game.i18n.localize('STR') + '</strong>: <s>' + stat + '</s> => ' + newStat + '</p>'
            }
        }

        if (newStat < stat) {
            if (newStat === 0) {
                content += '<strong>' + game.i18n.localize('LIMINAL.Dead') + '</strong>'
            } else  {
                if(stress) {
                    content += '<p><strong>' + game.i18n.localize('LIMINAL.CtrlSave') + '</strong></p>'
                    content += '<button type="button" class="roll-str-save">Roll CTRL save</button>'        
                } else {
                    content += '<p><strong>' + game.i18n.localize('LIMINAL.StrSave') + '</strong></p>'
                    content += '<button type="button" class="roll-str-save">Roll STR save</button>'                    
                }
            }
        } else if (newHp === 0 && hp !== 0) {
            content += '<p><strong>' + game.i18n.localize('LIMINAL.Scars') + '</strong></p>'
            this._rollScarsTable(dmg);
        }

        ChatMessage.create({
            user: game.user._id,
            speaker: { actor },
            content: content,
        }, {})
    }

    static async _rollScarsTable(damage){
        const table = await findCompendiumItem("liminal.utils", "Scars");
        const roll = new Roll(damage.toString());
        await table.draw({roll});
    }

    static async _rollStrSave(actor,html){
        const roll = await evaluateFormula("d20cs<=@STR", actor.getRollData());
        const label = game.i18n.format("LIMINAL.Save",{key: game.i18n.localize("STR")});
        const rolled = roll.terms[0].results[0].result;
        const result = roll.total === 0 ? game.i18n.localize("LIMINAL.Fail") : game.i18n.localize("LIMINAL.Success");
        const resultCls = roll.total === 0 ? "failure" : "success";
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: label,
            content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4</div></div>`,
        });
        html.find(".roll-str-save").attr('disabled','disabled')
    }
}
