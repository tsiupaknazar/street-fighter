import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
  return new Promise((resolve) => {
    // resolve the promise with the winner when fight is over
    beforeStart(firstFighter, secondFighter);

    const firstFighterHealthBar = document.getElementById('left-fighter-indicator');
    const secondFighterHealthBar = document.getElementById('right-fighter-indicator');

    const hit = (attacker, defender, getCurrentDamage, bar, isCrit) => {

      if ((!attacker.isBlock && !defender.isBlock) || isCrit) {
        defender.currenthealth -= getCurrentDamage(attacker, defender);
        bar.style.width = defender.currenthealth >= 0 ? `${defender.currenthealth / defender.health * 100}%` : '0%';
      }

      if (defender.currenthealth <= 0) {
        resolve(attacker);
      }
    }

    document.addEventListener('keydown', event => {
      switch (event.code) {
        case controls.PlayerOneBlock:
          firstFighter.isBlock = true;
          break;
        case controls.PlayerTwoBlock:
          secondFighter.isBlock = true;
          break;
        default:
          if (controls.PlayerOneCriticalHitCombination.includes(event.code)) {
            tryToCriticalHit(firstFighter, secondFighter, hit, secondFighterHealthBar, event.code, controls.PlayerOneCriticalHitCombination);
          }
          if (controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
            tryToCriticalHit(secondFighter, firstFighter, hit, firstFighterHealthBar, event.code, controls.PlayerTwoCriticalHitCombination);
          }
          break;
      }
    });

    document.addEventListener('keyup', event => {
      switch (event.code) {
        case controls.PlayerOneAttack:
          hit(firstFighter, secondFighter, getDamage, secondFighterHealthBar);
          break;
        case controls.PlayerOneBlock:
          firstFighter.isBlock = false;
          break;
        case controls.PlayerTwoAttack:
          hit(secondFighter, firstFighter, getDamage, firstFighterHealthBar);
          break;
        case controls.PlayerTwoBlock:
          secondFighter.isBlock = false;
          break;
        default:
          if (controls.PlayerOneCriticalHitCombination.includes(event.code)) {
            collectCriticalCombo(firstFighter, event.code);
          }
          if (controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
            collectCriticalCombo(secondFighter, event.code);
          }
          break;
      }
    });
  });
}

export function getDamage(attacker, defender) {
  // return damage
  const damage = getHitPower(attacker) - getBlockPower(defender);
  return damage >= 0 ? damage : 0;
}

export function getHitPower(fighter) {
  // return hit power
  return fighter.attack * Math.random() + 1;
}

export function getBlockPower(fighter) {
  // return block power
  return fighter.defense * Math.random() + 1;
}
function getCriticalDamage(fighter) {
  return fighter.attack * 2;
}

function checkComboEquality(pressedCombo, expectedCombo) {
  return expectedCombo.every(value => pressedCombo.includes(value));
}

function collectCriticalCombo(fighter, keyPressed) {
  if (!fighter.pressedCombo) fighter.pressedCombo = new Set();
  fighter.pressedCombo.has(keyPressed) ? fighter.pressedCombo.delete(keyPressed) : fighter.pressedCombo.add(keyPressed);
}

function tryToCriticalHit(attacker, defender, makeHit, bar, keyPressed, combo) {
  collectCriticalCombo(attacker, keyPressed);

  const { isCriticalActive, isBlock } = attacker;

  if (checkComboEquality(Array.from(attacker.pressedCombo), combo) && isCriticalActive && !isBlock) {
    makeHit(attacker, defender, getCriticalDamage, bar, true);
    attacker.isCriticalActive = false;
    setTimeout(() => attacker.isCriticalActive = true, 10000);
  }
}

function beforeStart(firstFighter, secondFighter) {
  if (firstFighter === secondFighter) {
    firstFighter = { ...firstFighter }
  }

  firstFighter.currenthealth = firstFighter.health;
  secondFighter.currenthealth = secondFighter.health;

  firstFighter.isCriticalActive = true;
  secondFighter.isCriticalActive = true;
}
