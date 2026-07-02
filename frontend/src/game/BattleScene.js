import Phaser from 'phaser'

const CLASS_SHORT  = { warrior: 'WAR', mage: 'MAG', rogue: 'ROG' }
const CLASS_COLOR  = { warrior: 0x5287e0, mage: 0xa855f7, rogue: 0x22c55e }

const C = {
  bg:        0x0d0d14,
  ground:    0x1a1a2e,
  border:    0x2e2e4a,
  charBody:  0x1e3a5f,
  charBorder:0x5287e0,
  monBody:   0x5f1e1e,
  monBorder: 0xe05252,
  hpGreen:   0x52b36e,
  hpYellow:  0xf59e0b,
  hpRed:     0xe05252,
  monHp:     0xe05252,
  gold:      0xc9a84c,
}

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
    this._charMaxHp = 100
    this._monMaxHp  = 50
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.add.rectangle(W / 2, H / 2, W, H, C.bg)

    // Ground
    const ground = this.add.rectangle(W / 2, H * 0.78, W, H * 0.22, C.ground)
    ground.setAlpha(0.7)
    this.add.rectangle(W / 2, H * 0.67, W, 1, C.border)

    this.charX = W * 0.22
    this.charY = H * 0.46
    this.monX  = W * 0.78
    this.monY  = H * 0.46

    // ── CHARACTER ──
    this.charContainer = this.add.container(this.charX, this.charY)

    const charShadow = this.add.ellipse(0, 50, 56, 14, 0x000000, 0.4)
    const charBase   = this.add.rectangle(0, 0, 60, 76, C.charBody)
    charBase.setStrokeStyle(2, C.charBorder)

    this.charLabel = this.add.text(0, 0, 'WAR', {
      fontSize: '16px', fontStyle: 'bold', color: '#93c5fd',
    }).setOrigin(0.5)

    const charHpTrack = this.add.rectangle(0, -52, 76, 8, 0x0a0a18)
    charHpTrack.setStrokeStyle(1, C.border)

    this.charHpFill = this.add.rectangle(-38, -52, 76, 8, C.hpGreen)
    this.charHpFill.setOrigin(0, 0.5)

    this.charHpText = this.add.text(0, -64, 'HP 100/100', {
      fontSize: '10px', color: '#6a6880',
    }).setOrigin(0.5)

    this.charNameText = this.add.text(0, 50, '', {
      fontSize: '11px', color: '#c9a84c', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.charContainer.add([
      charShadow, charBase, this.charLabel,
      charHpTrack, this.charHpFill, this.charHpText, this.charNameText,
    ])

    // ── MONSTER ──
    this.monContainer = this.add.container(this.monX, this.monY)
    this.monContainer.setAlpha(0)

    const monShadow = this.add.ellipse(0, 50, 56, 14, 0x000000, 0.4)
    this.monBase    = this.add.rectangle(0, 0, 60, 76, C.monBody)
    this.monBase.setStrokeStyle(2, C.monBorder)

    this.monLabel = this.add.text(0, 0, 'MON', {
      fontSize: '14px', fontStyle: 'bold', color: '#fca5a5',
    }).setOrigin(0.5)

    const monHpTrack = this.add.rectangle(0, -52, 76, 8, 0x0a0a18)
    monHpTrack.setStrokeStyle(1, C.border)

    this.monHpFill = this.add.rectangle(-38, -52, 76, 8, C.monHp)
    this.monHpFill.setOrigin(0, 0.5)

    this.monHpText = this.add.text(0, -64, '', {
      fontSize: '10px', color: '#6a6880',
    }).setOrigin(0.5)

    this.monNameText = this.add.text(0, 50, '', {
      fontSize: '11px', color: '#e05252', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.monLvlText = this.add.text(0, 62, '', {
      fontSize: '9px', color: '#4a2a2a',
    }).setOrigin(0.5)

    this.monContainer.add([
      monShadow, this.monBase, this.monLabel,
      monHpTrack, this.monHpFill, this.monHpText,
      this.monNameText, this.monLvlText,
    ])

    // ── VS ──
    this.vsText = this.add.text(W / 2, H * 0.46, 'VS', {
      fontSize: '20px', color: '#1a1a2e', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.idleText = this.add.text(W / 2, H * 0.86, 'Select a monster to fight', {
      fontSize: '12px', color: '#2e2e4a',
    }).setOrigin(0.5)
  }

  // ── Public API ──

  setCharacter(char) {
    this._charMaxHp = char.max_health
    this.charLabel.setText(CLASS_SHORT[char.character_class] ?? 'HRO')
    const col = CLASS_COLOR[char.character_class] ?? 0x5287e0
    this.charLabel.setColor(`#${col.toString(16).padStart(6, '0')}`)
    this.charNameText.setText(char.name)
    this._updateCharHp(char.health)
  }

  _updateCharHp(current) {
    const pct = Math.max(0, current / this._charMaxHp)
    this.charHpFill.setScale(pct, 1)
    const color = pct > 0.5 ? C.hpGreen : pct > 0.25 ? C.hpYellow : C.hpRed
    this.charHpFill.setFillStyle(color)
    this.charHpText.setText(`HP ${current}/${this._charMaxHp}`)
  }

  spawnMonster(monster, currentHp) {
    this._monMaxHp = monster.health
    // abbreviate name to 3 chars for the body label
    this.monLabel.setText(monster.name.slice(0, 3).toUpperCase())
    this.monNameText.setText(monster.name)
    this.monLvlText.setText(`Lv.${monster.level}`)
    this._updateMonHp(currentHp ?? monster.health)

    this.vsText.setColor('#c9a84c')
    this.idleText.setVisible(false)

    this.monContainer.setAlpha(0)
    this.monContainer.setScale(0.7)
    this.tweens.add({
      targets: this.monContainer,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 380, ease: 'Back.Out',
    })
  }

  _updateMonHp(current) {
    const pct = Math.max(0, current / this._monMaxHp)
    this.monHpFill.setScale(pct, 1)
    this.monHpText.setText(`HP ${current}/${this._monMaxHp}`)
  }

  playAttack(damage, newMonHp) {
    this.tweens.add({
      targets: this.charContainer,
      x: this.charX + 52,
      duration: 110, ease: 'Power2', yoyo: true,
      onComplete: () => { this.charContainer.x = this.charX },
    })
    this.tweens.add({
      targets: this.monContainer,
      alpha: 0.15, duration: 80, yoyo: true, repeat: 1,
    })
    this.cameras.main.shake(200, 0.006)
    this._float(`-${damage}`, this.monX, this.monY - 50, '#f87171')
    this.time.delayedCall(140, () => this._updateMonHp(newMonHp))
  }

  playMonsterAttack(damage, newCharHp) {
    this.tweens.add({
      targets: this.monContainer,
      x: this.monX - 52,
      duration: 110, ease: 'Power2', yoyo: true,
      onComplete: () => { this.monContainer.x = this.monX },
    })
    this.tweens.add({
      targets: this.charContainer,
      alpha: 0.15, duration: 80, yoyo: true, repeat: 1,
    })
    this.cameras.main.shake(180, 0.005)
    this._float(`-${damage}`, this.charX, this.charY - 50, '#fca5a5')
    this.time.delayedCall(140, () => this._updateCharHp(newCharHp))
  }

  playDefeat() {
    this.cameras.main.shake(300, 0.01)
    this.tweens.add({
      targets: this.monContainer,
      alpha: 0, y: this.monY + 28,
      duration: 550, ease: 'Power2',
      onComplete: () => {
        this.monContainer.y = this.monY
        this.vsText.setColor('#1a1a2e')
        this.idleText.setVisible(true)
      },
    })
  }

  playCharacterDefeat() {
    this.cameras.main.shake(400, 0.012)
    this.tweens.add({
      targets: this.charContainer,
      alpha: 0, y: this.charY + 28,
      duration: 650, ease: 'Power2',
      onComplete: () => {
        this.charContainer.y = this.charY
        this.charContainer.setAlpha(1)
        this.vsText.setColor('#1a1a2e')
        this.idleText.setVisible(true)
      },
    })
    this.tweens.add({
      targets: this.monContainer,
      alpha: 0, duration: 400, delay: 500,
      onComplete: () => { this.monContainer.setAlpha(0) },
    })
  }

  clearMonster() {
    this.monContainer.setAlpha(0)
    this.monContainer.y = this.monY
    this.vsText.setColor('#1a1a2e')
    this.idleText.setVisible(true)
  }

  _float(text, x, y, color = '#f87171') {
    const t = this.add.text(x, y, text, {
      fontSize: '18px', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    this.tweens.add({
      targets: t, y: y - 46, alpha: 0,
      duration: 850, ease: 'Power2',
      onComplete: () => t.destroy(),
    })
  }
}
