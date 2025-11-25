"use strict"

class Particles {
    constructor(canvas, options) {
        this.m_canvas = canvas;
        this.m_gl = canvas.getContext("webgl2", { preserveDrawingBuffer: false });
        this._stopped = false;    

        if (this.m_gl === null) {
            throw "[WebGL] WebGL2 context not supported by browser.";
        }

        let feature = document.getElementById("attractor-feature")
        let feature_img = document.getElementById("attractor-feature-img")

        if (feature)
            feature.classList.remove("hidden")

        if (feature_img)
            feature_img.classList.add("hidden")

        this.m_rotate = true
        this.m_frames = 0
        this.m_velocity = [0, 0]
        this.m_noise_array = new Array(512 * 512 * 3).fill(0).map(_ => ~~(Math.random() * 255))
        this.m_colors = [
            0.145, 0.347, 0.745,
            0.145, 0.768, 0.502,
            0.851, 0.159, 0.225,
        ];

        ({
            num_particles: this.m_num_particles,
            camera: this.m_camera,
            ortho: this.m_clip,
            scale: this.m_scale,
            consts: this.m_consts,
            speed: this.m_speed,
            angles: this.m_angles,
            shaders: this.m_shaders,
            controls: this.m_controls
        } = options)

        this.m_shaders = Object.assign({
            render: {
                vertex: "render-vs",
                fragment: "render-fs"
            },
            update: {
                vertex: "update-vs",
                fragment: "update-fs"
            }
        }, this.m_shaders ?? {})

        this.setup()
    }

    createBuffer(data, usage) {
        const buf = this.m_gl.createBuffer()

        this.m_gl.bindBuffer(this.m_gl.ARRAY_BUFFER, buf)
        this.m_gl.bufferData(this.m_gl.ARRAY_BUFFER, data, usage)

        return buf
    }

    createVertexArray(pairs) {
        const va = this.m_gl.createVertexArray()
        this.m_gl.bindVertexArray(va)

        for (const [buf, loc] of pairs) {
            this.m_gl.bindBuffer(this.m_gl.ARRAY_BUFFER, buf)
            this.m_gl.enableVertexAttribArray(loc)
            this.m_gl.vertexAttribPointer(loc, 3, this.m_gl.FLOAT, false, 0, 0)
        }

        return va
    }

    transformFeedback(buf) {
        const fb = this.m_gl.createTransformFeedback()

        this.m_gl.bindTransformFeedback(this.m_gl.TRANSFORM_FEEDBACK, fb)
        this.m_gl.bindBufferBase(this.m_gl.TRANSFORM_FEEDBACK_BUFFER, 0, buf)

        return fb
    }

    setup() {
        const update = this.createProgram(
            [[this.m_gl.VERTEX_SHADER, this.m_shaders.update.vertex],
            [this.m_gl.FRAGMENT_SHADER, this.m_shaders.update.fragment]],
            ["o_Position"]
        )

        const render = this.createProgram(
            [[this.m_gl.VERTEX_SHADER, this.m_shaders.render.vertex],
            [this.m_gl.FRAGMENT_SHADER, this.m_shaders.render.fragment]]
        )

        const location_update = {
            i_Position: this.m_gl.getAttribLocation(update, "i_Position"),
            u_Consts: this.m_gl.getUniformLocation(update, "u_Consts"),
            u_Speed: this.m_gl.getUniformLocation(update, "u_Speed"),
            u_RgbNoise: this.m_gl.getUniformLocation(update, "u_RgbNoise"),
        }

        const location_render = {
            i_Position: this.m_gl.getAttribLocation(render, "i_Position"),
            u_Camera: this.m_gl.getUniformLocation(render, "u_Camera"),
            u_Transform: this.m_gl.getUniformLocation(render, "u_Transform"),
            u_Scale: this.m_gl.getUniformLocation(render, "u_Scale"),
            u_Perspective: this.m_gl.getUniformLocation(render, "u_Perspective"),
            u_Colors: this.m_gl.getUniformLocation(render, "u_Colors")
        }

        const positions = Float32Array.from(new Array(3 * this.m_num_particles).fill(0).map(_ => Math.random()))

        const position_bufs = [
            this.createBuffer(positions, this.m_gl.DYNAMIC_DRAW),
            this.createBuffer(positions, this.m_gl.DYNAMIC_DRAW),
        ]

        const update_vao = position_bufs.map(v => this.createVertexArray([[v, location_update.i_Position]]))
        const render_vao = position_bufs.map(v => this.createVertexArray([[v, location_render.i_Position]]))

        const fb = position_bufs.map(v => this.transformFeedback(v))

        this.m_gl.bindBuffer(this.m_gl.ARRAY_BUFFER, null)
        this.m_gl.bindBuffer(this.m_gl.TRANSFORM_FEEDBACK_BUFFER, null)

        this.m_gl.enable(this.m_gl.BLEND)
        this.m_gl.blendFunc(this.m_gl.SRC_ALPHA, this.m_gl.ONE_MINUS_SRC_ALPHA)

        this.m_last = performance.now()
        this.m_data = {
            programs: {
                update: update,
                render: render
            },
            locations: {
                update: location_update,
                render: location_render
            },
            current: {
                update: update_vao[0],
                render: render_vao[1],
                feedback: fb[1]
            },
            next: {
                update: update_vao[1],
                render: render_vao[0],
                feedback: fb[0]
            },
        }

        if (!this.m_controls)
            this.setupOrbit()

        requestAnimationFrame(this.render)
    }

    setupOrbit() {
        this.m_drag = null

        const drag_handler = e => {
            if (this.m_drag === null)
                return

            const coords = getCoordinates(e)
            const ex = coords[0]
            const ey = coords[1]

            const [px, py] = this.m_drag

            const dx = (ex - px) / 100
            const dy = (ey - py) / 100

            this.m_angles[0] += dy
            this.m_angles[1] += dx
            this.m_angles = this.m_angles

            this.m_drag = [ex, ey]
            this.m_delta = [dx, dy]
        }

        const press_handler = e => {
            this.m_drag = getCoordinates(e)
            this.m_canvas.style.cursor = "grabbing"
            this.m_rotate = false
        }

        const lift_handler = _ => {
            if (this.m_drag === null)
                return

            this.m_drag = null
            this.m_canvas.style.cursor = "grab"
            this.m_rotate = true

            if (this.m_delta) {
                this.m_velocity[0] += this.m_delta[0];
                this.m_velocity[1] += this.m_delta[1];
            }

this.m_delta = [0, 0];


            this.m_delta = [0, 0]
        }

        const getCoordinates = e => {
            const coords = (typeof (e.touches) === "undefined") ? e : e.touches[0]

            return [coords.clientX, coords.clientY]
        }

        this.m_canvas.addEventListener("mousedown", press_handler)
        document.addEventListener("mouseup", lift_handler)
        document.addEventListener("mousemove", drag_handler)

        this.m_canvas.addEventListener("touchstart", press_handler)
        document.addEventListener("touchend", lift_handler)
        document.addEventListener("touchmove", drag_handler)
    }

        get render() {
            if (this.__render === undefined)
                this.__render = _ => {

                    // 🔥 EKLEMEN GEREKEN SATIR
                    if (this._stopped) return;

                    const now = performance.now()
                    const delta = now - this.m_last

                const frame_time = 1000 / 60

                if (delta < frame_time)
                    return requestAnimationFrame(this.render)

                // For the random noise texture, we must generate 512 * 512 * 3 values every 128 frames
                // We split the workload into units of 6144 values per frame to reduce lag
                const offset = this.m_frames % 128 * 6144

                for (let i = 0; i < 6144; i++)
                    this.m_noise_array[offset + i] = ~~(Math.random() * 255)

                // Generate new random noise every 128 frames to make sure the attractor does not settle.
                // FIXME: Loading new textures causes noticable lag on slower devices
                if (this.m_frames++ % 128 == 0)
                    this.m_noise = this.createNoise()

                this.m_last = now - (delta % frame_time)

                this.m_gl.clearColor(0, 0, 0, 0)
                this.m_gl.clear(this.m_gl.COLOR_BUFFER_BIT | this.m_gl.DEPTH_BUFFER_BIT)

                this.m_gl.useProgram(this.m_data.programs.update)
                this.m_gl.bindVertexArray(this.m_data.current.update)

                this.m_gl.uniform1fv(this.m_data.locations.update.u_Consts, this.m_consts)
                this.m_gl.uniform1f(this.m_data.locations.update.u_Speed, this.m_speed)

                this.m_gl.activeTexture(this.m_gl.TEXTURE0)
                this.m_gl.bindTexture(this.m_gl.TEXTURE_2D, this.m_noise)
                this.m_gl.uniform1i(this.m_data.locations.update.u_RgbNoise, 0)

                this.m_gl.enable(this.m_gl.RASTERIZER_DISCARD)

                this.m_gl.bindTransformFeedback(this.m_gl.TRANSFORM_FEEDBACK, this.m_data.current.feedback)
                this.m_gl.beginTransformFeedback(this.m_gl.POINTS)
                this.m_gl.drawArrays(this.m_gl.POINTS, 0, this.m_num_particles)
                this.m_gl.endTransformFeedback()
                this.m_gl.bindTransformFeedback(this.m_gl.TRANSFORM_FEEDBACK, null)

                this.m_gl.disable(this.m_gl.RASTERIZER_DISCARD)

                this.m_gl.useProgram(this.m_data.programs.render)

                this.m_gl.uniform3f(this.m_data.locations.render.u_Camera, ...this.m_camera)
                this.m_gl.uniform1f(this.m_data.locations.render.u_Transform, this.m_scale)

                this.m_gl.uniformMatrix4fv(this.m_data.locations.render.u_Scale, false, this.m_orthographic)
                this.m_gl.uniformMatrix3fv(this.m_data.locations.render.u_Perspective, false, this.m_perspective)

                this.m_gl.uniform3fv(this.m_data.locations.render.u_Colors, this.m_colors)

                this.m_gl.bindVertexArray(this.m_data.current.render)
                this.m_gl.viewport(0, 0, this.m_gl.canvas.width, this.m_gl.canvas.height)
                this.m_gl.drawArrays(this.m_gl.POINTS, 0, this.m_num_particles)

                this.m_data.current = [this.m_data.next, this.m_data.next = this.m_data.current][0]

                if (this.m_rotate) {
                    const [vx, vy] = this.m_velocity

                    this.m_angles[1] += 0.0015 + vx
                    this.m_angles[0] += vy

                    this.m_velocity[0] = (Math.abs(vx) > 1e-4) ? vx / 1.05 : 0
                    this.m_velocity[1] = (Math.abs(vy) > 1e-4) ? vy / 1.05 : 0

                    this.m_angles = this.m_angles
                }

                requestAnimationFrame(this.render)
            }

        return this.__render;
    }

    createShader(type, name) {
        const shader = this.m_gl.createShader(type)
        const source = document.getElementById(name).text

        this.m_gl.shaderSource(shader, source.trimStart())
        this.m_gl.compileShader(shader)

        if (!this.m_gl.getShaderParameter(shader, this.m_gl.COMPILE_STATUS))
            throw (`[WebGL] Failed to compile shaders in "${name}".\n\n` + this.m_gl.getShaderInfoLog(shader))

        return shader
    }

    createProgram(shaders, transforms) {
        const program = this.m_gl.createProgram()

        for (let shader of shaders)
            this.m_gl.attachShader(program, this.createShader(...shader))

        if (transforms)
            this.m_gl.transformFeedbackVaryings(program, transforms, this.m_gl.INTERLEAVED_ATTRIBS)

        this.m_gl.linkProgram(program)

        if (!this.m_gl.getProgramParameter(program, this.m_gl.LINK_STATUS))
            throw ("[WebGL] Failed to link program.")

        return program
    }

    createNoise() {
        const RgbNoise = this.m_gl.createTexture()

        this.m_gl.bindTexture(this.m_gl.TEXTURE_2D, RgbNoise)
        this.m_gl.texImage2D(
            this.m_gl.TEXTURE_2D, 0,
            this.m_gl.RGB8, 512, 512, 0, this.m_gl.RGB,
            this.m_gl.UNSIGNED_BYTE,
            Uint8ClampedArray.from(this.m_noise_array)
        )

        this.m_gl.texParameteri(this.m_gl.TEXTURE_2D, this.m_gl.TEXTURE_WRAP_S, this.m_gl.MIRRORED_REPEAT)
        this.m_gl.texParameteri(this.m_gl.TEXTURE_2D, this.m_gl.TEXTURE_WRAP_T, this.m_gl.MIRRORED_REPEAT)
        this.m_gl.texParameteri(this.m_gl.TEXTURE_2D, this.m_gl.TEXTURE_MIN_FILTER, this.m_gl.NEAREST)
        this.m_gl.texParameteri(this.m_gl.TEXTURE_2D, this.m_gl.TEXTURE_MAG_FILTER, this.m_gl.NEAREST)

        return RgbNoise;
    }

    set m_angles(angles) {
        // Array of Tait-Bryan angles
        // See https://en.wikipedia.org/wiki/Euler_angles
        const [[cx, cy, cz], [sx, sy, sz]] = [angles.map(v => Math.cos(v)), angles.map(v => Math.sin(v))]

        this.__m_perspective = [
            cy * cz, cy * sz, -sy,
            sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy,
            cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy
        ]

        this.__m_angles = angles
    }

    get m_angles() {
        return this.__m_angles
    }

    set m_clip(clip) {
        this.__m_clip = clip

        this.m_orthographic = [
            1 / (2 * clip), 0., 0., 0.,
            0., 1 / (2 * clip), 0., 0.,
            0., 0., 1 / (2 * clip), 0.,
            0., 0., 0., 1.
        ]
    }

    get m_clip() {
        return this.__m_clip
    }


    get m_perspective() {
        return this.__m_perspective || [0, 0, 0]
    }

    destroy() {
    this._stopped = true;
}

}

export { Particles };

