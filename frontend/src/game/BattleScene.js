import Phaser from 'phaser'

// sprite configs: key, frame size, animation rows
// fw/fh = frame size; displayH = target rendered height px; idle/attack/hurt/death = [start,end]
const SPRITES = {
  goblin:   { file: 'goblin sheet.png',           fw: 300, fh: 180, displayH: 90,  idle: [0,0], attack: [18,24], hurt: [27,31], death: [36,43] },
  crab:     { file: 'crab sheet.png',             fw: 150, fh: 135, displayH: 75,  idle: [0,0], attack: [18,24], hurt: [27,31], death: [36,43] },
  slime:    { file: 'slime waterB sheet.png',     fw: 300, fh: 135, displayH: 70,  idle: [0,0], attack: [18,23], hurt: [27,30], death: [36,41] },
  turnip:   { file: 'turnip sheet.png',           fw: 150, fh: 135, displayH: 65,  idle: [0,0], attack: [18,24], hurt: [27,31], death: [36,43] },
  dummy:    { file: 'training dummy sheet.png',   fw: 200, fh: 200, displayH: 85,  idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
  rat:      { file: 'Rat_0004_dark.png',          fw: 225, fh: 225, displayH: 60,  idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,32] },
  bat:      { file: 'Bat_0000_dark.png',          fw: 150, fh: 150, displayH: 65,  idle: [0,0], attack: [9,13],  hurt: [18,20], death: [27,30] },
  wolf:     { file: 'wolf_0001_brown.png',        fw: 325, fh: 260, displayH: 90,  idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,32] },
  skeleton: { file: 'skelleton sheet.png',        fw: 350, fh: 252, displayH: 100, idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
  gnoll:    { file: 'gnoll sheet.png',            fw: 375, fh: 260, displayH: 105, idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
  sahuagin: { file: 'sahuagin sheet.png',         fw: 300, fh: 229, displayH: 95,  idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
  werewolf: { file: 'Werewolf_0004_brown.png',    fw: 400, fh: 277, displayH: 115, idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
  troll:    { file: 'troll_0000_green.png',       fw: 435, fh: 287, displayH: 125, idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
  kobold:   { file: 'kobold_0000_red.png',        fw: 300, fh: 216, displayH: 80,  idle: [0,0], attack: [9,14],  hurt: [18,21], death: [27,33] },
}

// Russian monster name → sprite key
function getSpriteKey(name = '') {
  const n = name.toLowerCase()
  if (n.includes('гоблин'))    return 'goblin'
  if (n.includes('краб'))      return 'crab'
  if (n.includes('слиз'))      return 'slime'
  if (n.includes('репа'))      return 'turnip'
  if (n.includes('манекен'))   return 'dummy'
  if (n.includes('крыс'))      return 'rat'
  if (n.includes('мыш'))       return 'bat'
  if (n.includes('волк'))      return 'wolf'
  if (n.includes('скелет'))    return 'skeleton'
  if (n.includes('гнолл'))     return 'gnoll'
  if (n.includes('сахуагин'))  return 'sahuagin'
  if (n.includes('оборотень')) return 'werewolf'
  if (n.includes('тролл'))     return 'troll'
  if (n.includes('кобольд'))   return 'kobold'
  return null
}

const C = {
  bg: 0x0d0d14, ground: 0x1a1a2e, border: 0x2e2e4a,
  charBody: 0x1e3a5f, charBorder: 0x5287e0,
  hpGreen: 0x52b36e, hpYellow: 0xf59e0b, hpRed: 0xe05252,
  gold: 0xc9a84c,
}
const CLASS_SHORT = { warrior: 'WAR', mage: 'MAG', rogue: 'ROG' }
const CLASS_COL   = { warrior: '#93c5fd', mage: '#d8b4fe', rogue: '#86efac' }

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
    this._charMaxHp = 100
    this._monMaxHp  = 50
    this._monSprite = null
    this._monSpriteKey = null
  }

  preload() {
    Object.entries(SPRITES).forEach(([key, cfg]) => {
      this.load.spritesheet(key, `/assets/${cfg.file}`, {
        frameWidth: cfg.fw,
        frameHeight: cfg.fh,
      })
    })
  }

  _createAnims() {
    Object.entries(SPRITES).forEach(([key, cfg]) => {
      const make = (suffix, start, end, rate, repeat) => {
        const k = `${key}_${suffix}`
        if (!this.anims.exists(k)) {
          this.anims.create({
            key: k,
            frames: this.anims.generateFrameNumbers(key, { start, end }),
            frameRate: rate,
            repeat,
          })
        }
      }
      // idle = single static frame (row 0, frame 0) — avoids playing wrong animation
      make('idle',   cfg.idle[0], cfg.idle[0],   1, -1)
      make('attack', cfg.attack[0], cfg.attack[1], 10,  0)
      make('hurt',   cfg.hurt[0],   cfg.hurt[1],   10,  0)
      make('death',  cfg.death[0],  cfg.death[1],   8,  0)
    })
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.add.rectangle(W / 2, H / 2, W, H, C.bg)
    const ground = this.add.rectangle(W / 2, H * 0.78, W, H * 0.22, C.ground)
    ground.setAlpha(0.7)
    this.add.rectangle(W / 2, H * 0.67, W, 1, C.border)

    this.charX = W * 0.22
    this.charY = H * 0.46
    this.monX  = W * 0.78
    this.monY  = H * 0.46

    // ── CHARACTER (rectangle — no char sprite yet) ──
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
    this.charContainer.add([charShadow, charBase, this.charLabel,
      charHpTrack, this.charHpFill, this.charHpText, this.charNameText])

    // ── MONSTER HP bar (above sprite) ──
    this.monHpContainer = this.add.container(this.monX, this.monY - 90)
    this.monHpContainer.setAlpha(0)
    const monHpTrack = this.add.rectangle(0, 0, 100, 8, 0x0a0a18)
    monHpTrack.setStrokeStyle(1, C.border)
    this.monHpFill = this.add.rectangle(-50, 0, 100, 8, 0xe05252)
    this.monHpFill.setOrigin(0, 0.5)
    this.monHpText = this.add.text(0, -14, '', {
      fontSize: '10px', color: '#6a6880',
    }).setOrigin(0.5)
    this.monNameText = this.add.text(0, 14, '', {
      fontSize: '11px', color: '#e05252', fontStyle: 'bold',
    }).setOrigin(0.5)
    this.monHpContainer.add([monHpTrack, this.monHpFill, this.monHpText, this.monNameText])

    // ── VS / idle hint ──
    this.vsText = this.add.text(W / 2, H * 0.46, 'VS', {
      fontSize: '20px', color: '#1a1a2e', fontStyle: 'bold',
    }).setOrigin(0.5)
    this.idleText = this.add.text(W / 2, H * 0.86, 'Исследуйте мир чтобы найти врага', {
      fontSize: '12px', color: '#2e2e4a',
    }).setOrigin(0.5)

    // create animations after all scene objects — errors here won't blank the scene
    try { this._createAnims() } catch (e) { console.warn('BattleScene anims error:', e) }
  }

  // ── Public API ──

  setCharacter(char) {
    this._charMaxHp = char.max_health ?? 100
    this.charLabel.setText(CLASS_SHORT[char.character_class] ?? 'HRO')
    this.charLabel.setColor(CLASS_COL[char.character_class] ?? '#ffffff')
    this.charNameText.setText(char.name)
    this._updateCharHp(char.health)
  }

  _updateCharHp(current) {
    const pct = Math.max(0, current / this._charMaxHp)
    this.charHpFill.setScale(pct, 1)
    this.charHpFill.setFillStyle(pct > 0.5 ? C.hpGreen : pct > 0.25 ? C.hpYellow : C.hpRed)
    this.charHpText.setText(`HP ${current}/${this._charMaxHp}`)
  }

  spawnMonster(monster, currentHp) {
    this._monMaxHp = monster.health
    this.monNameText.setText(monster.name)
    this._updateMonHp(currentHp ?? monster.health)

    this.vsText.setColor('#c9a84c')
    this.idleText.setVisible(false)

    // destroy previous sprite if different monster
    const key = getSpriteKey(monster.name)

    if (this._monSprite) {
      this._monSprite.destroy()
      this._monSprite = null
    }

    if (key && SPRITES[key]) {
      // sprite monster
      const cfg = SPRITES[key]
      const scale = cfg.displayH / cfg.fh
      this._monSprite = this.add.sprite(this.monX, this.monY + 10, key)
      this._monSprite.setScale(scale)
      if (this.anims.exists(`${key}_idle`)) this._monSprite.play(`${key}_idle`)
      this._monSpriteKey = key
    } else {
      // fallback rectangle
      this._monSprite = this.add.rectangle(this.monX, this.monY, 60, 76, 0x5f1e1e)
      this._monSprite.setStrokeStyle(2, 0xe05252)
      this._monSpriteKey = null
    }

    // animate in
    this._monSprite.setAlpha(0)
    this.monHpContainer.setAlpha(0)
    this.tweens.add({
      targets: [this._monSprite, this.monHpContainer],
      alpha: 1, duration: 380, ease: 'Power2',
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
      x: this.charX + 52, duration: 110, ease: 'Power2', yoyo: true,
      onComplete: () => { this.charContainer.x = this.charX },
    })
    if (this._monSprite) {
      this.tweens.add({ targets: this._monSprite, alpha: 0.15, duration: 70, yoyo: true, repeat: 1 })
    }
    this.cameras.main.shake(200, 0.006)
    this._float(`-${damage}`, this.monX, this.monY - 100, '#f87171')
    this.time.delayedCall(140, () => this._updateMonHp(newMonHp))
  }

  playMonsterAttack(damage, newCharHp) {
    if (this._monSprite && this._monSpriteKey) {
      this._monSprite.play(`${this._monSpriteKey}_attack`)
        .once('animationcomplete', () => {
          if (this._monSprite?.active) this._monSprite.play(`${this._monSpriteKey}_idle`)
        })
    } else if (this._monSprite) {
      this.tweens.add({
        targets: this._monSprite,
        x: this.monX - 52, duration: 110, ease: 'Power2', yoyo: true,
        onComplete: () => { if (this._monSprite) this._monSprite.x = this.monX },
      })
    }
    this.tweens.add({
      targets: this.charContainer, alpha: 0.2, duration: 80, yoyo: true, repeat: 1,
    })
    this.cameras.main.shake(180, 0.005)
    this._float(`-${damage}`, this.charX, this.charY - 60, '#fca5a5')
    this.time.delayedCall(140, () => this._updateCharHp(newCharHp))
  }

  playDefeat() {
    this.cameras.main.shake(300, 0.01)
    if (this._monSprite) {
      this.tweens.add({
        targets: this._monSprite,
        alpha: 0, y: this._monSprite.y + 30,
        duration: 700, delay: 200, ease: 'Power2',
      })
    }
    this.tweens.add({
      targets: this.monHpContainer,
      alpha: 0, duration: 300, delay: 100, ease: 'Power2',
      onComplete: () => {
        this._monSprite?.destroy()
        this._monSprite = null
        this.vsText.setColor('#1a1a2e')
        this.idleText.setVisible(true)
      },
    })
  }

  playCharacterDefeat() {
    this.cameras.main.shake(400, 0.012)
    this.tweens.add({
      targets: this.charContainer, alpha: 0, y: this.charY + 28,
      duration: 650, ease: 'Power2',
      onComplete: () => {
        this.charContainer.y = this.charY
        this.charContainer.setAlpha(1)
        this.vsText.setColor('#1a1a2e')
        this.idleText.setVisible(true)
      },
    })
    this.tweens.add({
      targets: [this._monSprite, this.monHpContainer],
      alpha: 0, duration: 400, delay: 500,
      onComplete: () => { this._monSprite?.destroy(); this._monSprite = null },
    })
  }

  _float(text, x, y, color = '#f87171') {
    const t = this.add.text(x, y, text, {
      fontSize: '18px', fontStyle: 'bold', color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)
    this.tweens.add({
      targets: t, y: y - 46, alpha: 0, duration: 850, ease: 'Power2',
      onComplete: () => t.destroy(),
    })
  }
}
