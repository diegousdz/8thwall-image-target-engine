AFRAME.registerComponent('simple-image-target', {
  schema: {
    name: { type: 'string' },
  },
  init() {
    console.log('simple-image-target: Component init for target:', this.data.name)
    const { object3D } = this.el
    const { name } = this.data
    object3D.visible = false

    const showImage = (e) => {
      const { detail } = e
      if (name !== detail.name) {
        return
      }
      console.log('simple-image-target: Found/Updated:', detail.name)
      if (detail.position) object3D.position.copy(detail.position)
      if (detail.rotation) object3D.quaternion.copy(detail.rotation)
      if (detail.scale) object3D.scale.set(detail.scale, detail.scale, detail.scale)
      object3D.visible = true
    }

    const hideImage = (e) => {
      const { detail } = e
      if (name !== detail.name) {
        return
      }
      console.log('simple-image-target: Lost:', detail.name)
      object3D.visible = false
    }

    this.el.sceneEl.addEventListener('xrimagefound', showImage)
    this.el.sceneEl.addEventListener('xrimageupdated', showImage)
    this.el.sceneEl.addEventListener('xrimagelost', hideImage)
  },
})
