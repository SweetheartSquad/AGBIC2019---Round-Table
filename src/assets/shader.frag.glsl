#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uMainSampler;
uniform float time;
uniform vec2 resolution;
varying vec2 outTexCoord;

// https://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner
float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

const float posterize = 8.0;
void main(void) {
	vec2 suv = outTexCoord.xy / resolution.yx * resolution.x;

	vec3 col = texture2D(uMainSampler, outTexCoord).rgb;

	float brightness = max(col.g, col.r);
	vec2 rnoise = suv*resolution.x*0.25 + vec2(time*0.0006)*(1.0-col.b);
	float r = step(noise(rnoise)*.5+.5, col.r - col.g);
	// force black/white
	vec2 bwnoise = suv.yx*resolution.x*0.25 + vec2(time*0.0006)*(1.0-col.b);
	vec3 bw = vec3(step(noise(bwnoise)*.5+.5, brightness));
	// pick between red and black/white
	col = mix(bw, vec3(1.0, 0.0, 0.0), r);

	col *= brightness;

	// dither
	vec3 raw = col;
	vec3 posterized = raw - mod(raw, 1.0/posterize);

	vec2 dit = floor(mod(outTexCoord * resolution, 4.0));
	float limit = fract((gl_FragCoord.x+gl_FragCoord.y)*0.5)+0.5;
	vec3 dither = step(limit, (raw - posterized) * posterize) / posterize;

	col = vec3(posterized + dither);


	gl_FragColor = vec4(col, 1.0);
}
