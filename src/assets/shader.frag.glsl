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

void main(void) {
	vec2 suv = outTexCoord.xy / resolution.yx * resolution.x;

	vec3 col = texture2D(uMainSampler, outTexCoord).rgb;
	float brightness = max(col.g, col.r);//dot(col, vec3(0.299, 0.587, 0.114));
	float r = step(noise(suv*resolution.x*0.33 + time/100.0)*.5+.5, col.r - (col.g + col.b) * 0.5);
	// force black/white
	// vec3 bw = vec3(brightness);
	vec3 bw = vec3(step(noise(suv*resolution.x*0.33 + time/100.0)*.5+.5, brightness));
	// pick between red and black/white
	col = mix(bw, vec3(1.0, 0.0, 0.0), r);
	gl_FragColor = vec4(col*brightness, 1.0);
	// gl_FragColor = vec4(vec3(col.r - (col.g + col.b) * 0.5), 1.0);
	// gl_FragColor = vec4(vec3(r), 1.0);
}
