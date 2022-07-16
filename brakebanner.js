class BrakeBanner{
	constructor(selector){
		// 创建项目
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xf3f3f3,
			resizeTo: window, // ???
		})
		this.bikeScale = 0.25
		this.bike = null;
		// 挂载
		document.querySelector(selector).appendChild(this.app.view)

		this.loader = new PIXI.Loader()
		this.stage = this.app.stage
		// 加载图片资源
		this.loader.add('btn.png', 'images/btn.png')
		this.loader.add('btn_circle.png', 'images/btn_circle.png')
		this.loader.add('brake_bike.png', 'images/brake_bike.png')
		this.loader.add('brake_handlerbar.png', 'images/brake_handlerbar.png')
		this.loader.add('brake_lever.png', 'images/brake_lever.png')

		this.loader.load()
		this.loader.onComplete.add(() => {
			this.show()
		})
	}
	show() {
		let actionBtn = this.createActionBtn()
		let particleContainer = this.createParticle()
		let {bikeContainer, bikeLeverImage} = this.createBike()
		this.bike = bikeContainer
		// 改变自行车容器旋转中心
		bikeContainer.pivot.y = bikeContainer.pivot.x = bikeContainer.width / 2 / this.bikeScale
		// pointerdown 兼容pc & 移动的点击事件
		actionBtn.on('mousedown', () => {
			particleContainer.pause()
			// bikeLeverImage.rotation = Math.PI / 180 * -30 // 逆时针旋转30度
			gsap.to(bikeLeverImage, {duration: .6, rotation: Math.PI / 180 * -30})
		})
		actionBtn.on('mouseup', () => {
			particleContainer.start()
			gsap.to(bikeLeverImage, {duration: .6, rotation: 0})
			// gsap.to(bikeContainer, {duration: .6, rotation: 0})
		})
		let resize = () => {
			bikeContainer.x = window.innerWidth - bikeContainer.width / 2
			bikeContainer.y = window.innerHeight - bikeContainer.height / 2
			actionBtn.x = window.innerWidth - bikeContainer.width + 130
			actionBtn.y = window.innerHeight - bikeContainer.height + 90
		}
		resize()
		window.addEventListener('resize', resize)
	}
	createActionBtn() {
		let actionBtn = new PIXI.Container()
		this.stage.addChild(actionBtn)
		
		let btnImage = new PIXI.Sprite(this.loader.resources['btn.png'].texture)
		let btnCircle = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture)
		let btnCircle2 = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture)
			 
		actionBtn.addChild(btnImage)
		actionBtn.addChild(btnCircle)
		actionBtn.addChild(btnCircle2)

		actionBtn.interactive = true; // 开启交互
		actionBtn.buttonMode = true; // 鼠标移动上去变成小手

		actionBtn.scale.x = actionBtn.scale.y = 0.5 // 调整按钮大小
		btnImage.pivot.x = btnImage.pivot.y = btnImage.width / 2 // 更改旋转中心
		btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width / 2
		btnCircle2.pivot.x = btnCircle2.pivot.y = btnCircle2.width / 2
		actionBtn.x = actionBtn.y = 150

		btnCircle.scale.x = btnCircle.scale.y = 0.8
		gsap.to(btnCircle.scale, {duration: 1, x: 1.3, y: 1.3, repeat: -1})
		gsap.to(btnCircle, {duration: 1, alpha: 0, repeat: -1})
		
		return actionBtn
	}
	createBike() {
		const bikeContainer = new PIXI.Container();
		bikeContainer.scale.x = bikeContainer.scale.y = this.bikeScale // 缩小图片大小
		// 加载车闸
		const bikeLeverImage = new PIXI.Sprite(this.loader.resources['brake_lever.png'].texture)
		bikeContainer.addChild(bikeLeverImage)
		// 更改车闸旋转中心和位置
		bikeLeverImage.pivot.x = bikeLeverImage.pivot.y = 455
		bikeLeverImage.x = 710
		bikeLeverImage.y = 910
		// 加载车架
		const bikeImage = new PIXI.Sprite(this.loader.resources['brake_bike.png'].texture)
		bikeContainer.addChild(bikeImage)
		// 加载车把手
		const bikeHandlerbarImage = new PIXI.Sprite(this.loader.resources['brake_handlerbar.png'].texture)
		bikeContainer.addChild(bikeHandlerbarImage)

		this.stage.addChild(bikeContainer);
		return {bikeContainer, bikeLeverImage}
	}
	createParticle() {
		// 1. 创建粒子
		let particleContainer = new PIXI.Container()
		this.stage.addChild(particleContainer)
		let particles = []
		let colors = [0x333333, 0xf16604, 0xb5cea8, 0x777777]
		for (let i = 0; i < 12; i++) {
			// 用pixi绘图去创建图形
			let gr = new PIXI.Graphics()
			gr.beginFill(colors[Math.floor(Math.random() * colors.length)])
			gr.drawCircle(0, 0, 6)
			gr.endFill()
			let pItem = {
				sx: Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				gr: gr
			}
			particles.push(pItem)

			gr.x = pItem.sx;
			gr.y = pItem.sy;

			particleContainer.addChild(gr)
		}
		let speed = 0;
		let status = true; // 骑行 false刹车
		const loop = () => {
			if(status) {
				speed += 0.4
			}else {
				speed -= 0.6
			}
			gsap.to(this.bike, {duration: .1, rotation: Math.PI/180 * Math.random() / 2})

			speed = Math.min(speed, 20)
			speed = Math.max(speed, 0)
			// 3. 向某一个角度持续移动：让容器旋转就实现了粒子斜着运动
			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i];
				pItem.gr.y += speed
				// 纵向拉长 点变成线
				if(speed >= 20) {
					pItem.gr.scale.y = 20;
					// x小则有颗粒感
					pItem.gr.scale.x = .05;
				}
				if(!status) {
					pItem.gr.scale.y = speed;
					pItem.gr.scale.x = 1 / speed;
					if(speed <= 5) {
						pItem.gr.scale.y = 1;
						pItem.gr.scale.x = 1;
						// elastic.out 回弹
						gsap.to(pItem.gr, {duration: .6, x: pItem.sx, y: pItem.sy, ease: 'elastic.out'})
						gsap.ticker.remove(loop)
					}
				}
				// 4. 超出边界后回到顶部继续移动
				if(pItem.gr.y > window.innerHeight) pItem.gr.y = 0;
			}
		}
		function start() {
			speed = 0
			status = true
			gsap.ticker.add(loop)
		}
		function pause() {
			status = false
			// 6. 停止时有回弹效果
			// for (let i = 0; i < particles.length; i++) {
			// 	let pItem = particles[i];
			// 	pItem.gr.scale.y = 1;
			// 	pItem.gr.scale.x = 1;
			// 	// elastic.out 回弹
			// 	gsap.to(pItem.gr, {duration: .6, x: pItem.sx, y: pItem.sy, ease: 'elastic.out'})
			// }
			// gsap.ticker.remove(loop)
		}
		// 改变容器的旋转中心到中心
		particleContainer.pivot.x = window.innerWidth / 2;
		particleContainer.pivot.y = window.innerHeight / 2;
		// 改变容器位置
		particleContainer.x = window.innerWidth / 2
		particleContainer.y = window.innerHeight / 2;

		particleContainer.rotation = Math.PI / 180 * 35
		// 开启一个循环任务
		gsap.ticker.add(loop)

		return {container: particleContainer, start, pause}
	}
}


