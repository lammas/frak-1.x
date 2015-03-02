/**
 * Directional light (affects entire buffer)
 */
var DirectionalLight = Light.extend({
	init: function(direction, color) {
		this._super();

		this.intensity = 1.0;
		this.color = color || new Color(1.0, 1.0, 1.0, 1.0);
		this.direction = vec3.fromValues(1.0, 1.0, 1.0);
		if (direction)
			this.setLightDirection(direction);

		this.geometry = null;
		this.material = null;
	},

	type: function() {
		return "DirectionalLight";
	},

	/** Sets light direction. The given vector is re-normalized.
		@param direction {vec3} The new light direction. Does not have to be normalized. */
	setLightDirection: function(direction) {
		vec3.copy(this.direction, direction);
		vec3.normalize(this.direction, this.direction);
	},

	onStart: function(context, engine) {
		this._super();

		this.material = new Material(
			engine.assetsManager.addShaderSource("shaders/default/deferred_light_directional"),
			{
				'lightColor': new UniformColor(this.color),
				'lightIntensity': new UniformFloat(this.intensity),
				'lightDirection': new UniformVec3(vec3.create())
			},
			[]
		);

		var mesh = new Mesh();
		var submesh = new Submesh();
		submesh.positions = [
			-1, -1, 0,
			-1, 1, 0,
			1, 1, 0,
			1, -1, 0
		];
		submesh.normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0
		];
		submesh.texCoords2D = [[
			0.0, 0.0,
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0
		]];
		submesh.faces = [0, 1, 2, 0, 2, 3];
		submesh.recalculateBounds();
		mesh.addSubmesh(submesh, this.material);

		this.geometry = new Node("DirectionalLightGeometry");
		this.geometry.addComponent(new MeshComponent(mesh));
		this.geometry.addComponent(new MeshRendererComponent()).disable();
		this.node.addNode(this.geometry);

		engine.assetsManager.load();
	},

	onUpdate: function() {
		vec4.set(this.material.uniforms.lightColor.value, this.color.r, this.color.g, this.color.b, this.color.a);
		vec3.copy(this.material.uniforms.lightDirection.value, this.direction);
		this.material.uniforms.lightIntensity.value = this.intensity;
	},

	getGeometryRenderers: function() {
		return this.geometry.getComponent(MeshRendererComponent).meshRenderers;
	}
});