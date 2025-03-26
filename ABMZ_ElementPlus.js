// =============================================================================
// ABMZ_ElementPlus.js
// Version: 1.00
// -----------------------------------------------------------------------------
// [Homepage]: ヱビのノート
//             http://www.zf.em-net.ne.jp/~ebi-games/
// =============================================================================



/*:
 * @target MZ
 * @plugindesc v1.00　属性威力の増加の関数を呼び出せるようにします。
 * @author ヱビ
 * @url http://www.zf.em-net.ne.jp/~ebi-games/
 * 
 * 
 * @help
 * ============================================================================
 * 機能一覧
 * ============================================================================
 * 
 *   
 * アクター・職業・敵キャラ・武器・防具のメモ：
 * <EPlus:光,level>
 *   a.EPlus(["光"]) の戻り値が、そのアクター・敵キャラのレベルになります。
 *   （ダメージ計算式で使うことを想定しています。スキル使用者：a）
 * <EPlus:光,100,武器,100>
 *   光属性の威力が100、武器の威力が100上がります。
 * 
 * アクター・敵キャラオブジェクトの関数：
 *   a.EPlus(["炎","光"])
 *   炎・光のポイントの合計を返します。
 * 
 * ============================================================================
 * 
 * Version 1.00
 *   公開
 * 
 * 
 */

(function() {
	"use strict";
	var parameters = PluginManager.parameters('ABMZ_ElementPlus');
//=============================================================================
// MVからの雑な移行・ゲージ回り（モンスター図鑑と同じ）
//=============================================================================
	
	Window_Base.prototype.textPadding = function() {
		return 6;
	}
	Window_Base.prototype.standardPadding = function() {
	    return 18;
	};
	Window_Selectable.prototype.itemRectForText = function(index) {
	    var rect = this.itemRect(index);
	    rect.x += this.textPadding();
	    rect.width -= this.textPadding() * 2;
	    return rect;
	};
Window_Selectable.prototype.spacing = function() {
    return 12;
};
Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    var fillW = Math.floor(width * rate);
    var gaugeY = y + this.lineHeight() - 8;
    this.contents.fillRect(x, gaugeY, width, 6, ColorManager.textColor(19));
    this.contents.gradientFillRect(x, gaugeY, fillW, 6, color1, color2);
};
Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = ColorManager.hpGaugeColor1();
    var color2 = ColorManager.hpGaugeColor2();
    this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.hpA, x, y, 44);
    this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width,
                           ColorManager.hpColor(actor), ColorManager.normalColor());
};

Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = ColorManager.mpGaugeColor1();
    var color2 = ColorManager.mpGaugeColor2();
    this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.mpA, x, y, 44);
    this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
                           ColorManager.mpColor(actor), ColorManager.normalColor());
};

Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
    width = width || 96;
    var color1 = ColorManager.tpGaugeColor1();
    var color2 = ColorManager.tpGaugeColor2();
    this.drawGauge(x, y, width, actor.tpRate(), color1, color2);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.tpA, x, y, 44);
    this.changeTextColor(ColorManager.tpColor(actor));
    this.drawText(actor.tp, x + width - 64, y, 64, 'right');
};


Window_Base.prototype.drawCurrentAndMax = function(current, max, x, y,
                                                   width, color1, color2) {
    var labelWidth = this.textWidth('HP');
    var valueWidth = this.textWidth('0000');
    var slashWidth = this.textWidth('/');
    var x1 = x + width - valueWidth;
    var x2 = x1 - slashWidth;
    var x3 = x2 - valueWidth;
    if (x3 >= x + labelWidth) {
        this.changeTextColor(color1);
        this.drawText(current, x3, y, valueWidth, 'right');
        this.changeTextColor(color2);
        this.drawText('/', x2, y, slashWidth, 'right');
        this.drawText(max, x1, y, valueWidth, 'right');
    } else {
        this.changeTextColor(color1);
        this.drawText(current, x1, y, valueWidth, 'right');
    }
};

//=============================================================================
// Game_Actor
//=============================================================================

	


	// 武器・防具のメモ <EPlus:光,level>
	Game_Actor.prototype.EPlusEquip = function (elementsArr) {
		const a = this;
		const level = this.level;
		let value = 0;
		const equips = this.equips();
		let elements = [];
		for (let i = 0; i < equips.length; i++) {
			if (!equips[i]) continue;
			if (equips[i].meta["EPlus"]) {
				elements = equips[i].meta["EPlus"].split(",");
				for (let j = 0; j < elements.length; j += 2) {
					for (let k = 0; k < elementsArr.length; k++) {
						if (elements[j] == elementsArr[k]) {
							value += Math.floor(Number(eval(elements[j + 1])));
						}
					}
				}
			}
		}
		return value;

	};


	// 職業のメモ <EPlus:光,level>
	Game_Actor.prototype.EPlusClass = function (elementsArr) {
		const a = this;
		const level = this.level;
		let value = 0;
		const c = this.currentClass();
		let elements = [];
		
		if (!c) return 0;
		if (!c.meta["EPlus"]) {
			return 0;
		}
		elements = c.meta["EPlus"].split(",");
		for (let j = 0; j < elements.length; j += 2) {
			for (let k = 0; k < elementsArr.length; k++) {
				if (elements[j] == elementsArr[k]) {
					value += Math.floor(Number(eval(elements[j + 1])));
				}
			}
		}
	
		
		return value;

	}
	Game_Actor.prototype.EPlus = function(elementsArr) {
		//if (!this.actor().meta["EPlus"]) {
		//	return 0;
		//}
		const a = this;
		const level = this.level;
		let value = 0;
		let elements = this.actor().meta["EPlus"].split(",");
		value += this.EPlusEquip(elementsArr);
		value += this.EPlusClass(elementsArr);
		for (let i = 0; i < elements.length;  i += 2) {
			for (let j = 0; j < elementsArr.length; j++) {
				if (elements[i] == elementsArr[j]) {
					value += Math.floor(Number(eval(elements[i + 1])));
					
				}
			}
		}
		return value;
	}
	/* 敵キャラのメモ <EPlus:光,level> */
	Game_Enemy.prototype.EPlus = function(element) {
		if (!this.enemy().meta["EPlus"]) {
			return 0;
		}
		let level = eval(this.enemy().meta.bookLevel);
		if (!this.enemy().meta.bookLevel) {
			level = this.atk;
		}
		const a = this;
		let value = 0;
		let elements = this.meta["EPlus"].split(",");
		for (let i = 0; i < elements.length;  i += 2) {
			for (let j = 0; j < arguments.length; j++) {
				if (elements[i] == arguments[j]) {
					value += Math.floor(Number(eval(elements[i + 1])));
					
				}
			}
		}
		return 0;
	}
})();