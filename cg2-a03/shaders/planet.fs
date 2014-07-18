/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Fragment Phong Shader to be extended to a "Planet" shader.
 *
 * expects position and normal vectors in eye coordinates per vertex;
 * expects uniforms for ambient light, directional light, and phong material.
 * 
 *
 */

precision mediump float;

// position and normal in eye coordinates
varying vec4  ecPosition;
varying vec3  ecNormal;
varying vec2  texCoords;
 
// transformation matrices
uniform mat4  modelViewMatrix;
uniform mat4  projectionMatrix;

// Ambient Light
uniform vec3 ambientLight;

// Material
struct PhongMaterial {
    vec3  ambient;
    vec3  diffuse;
    vec3  specular;
    float shininess;
};
uniform PhongMaterial material;

// Light Source Data for a directional light
struct LightSource {

    int  type;
    vec3 direction;
    vec3 color;
    bool on;
    
} ;
uniform LightSource light;

// flag for debug mode
uniform bool debugOn;

// flag for daytime mode
uniform bool dayTexOn;
uniform bool nightTexOn;
uniform bool everlastingDayOn;
uniform bool everlastingNightOn;

const float epsilon = 0.1;
const float numDebugStripes = 24.0;
const float debugFactor = 2.0;
const float dayFactor = 1.4;
const float nightFactor = 0.9;
const float duskAngle = 15.0;

// textures for the planet surface
uniform sampler2D dayTex;
uniform sampler2D nightTex;

/*

 Calculate surface color based on Phong illumination model.
 - pos:  position of point on surface, in eye coordinates
 - n:    surface normal at pos
 - v:    direction pointing towards the viewer, in eye coordinates
 + assuming directional light
 
 */
vec3 phong(vec3 pos, vec3 n, vec3 v, LightSource light, PhongMaterial material) {
    if (everlastingDayOn) {
        return texture2D(dayTex, texCoords).rgb;
    }
    if (everlastingNightOn) {
        return texture2D(nightTex, texCoords).rgb;
    }

    // ambient part
    vec3 ambient = material.ambient * ambientLight;

    // back face towards viewer (looking at the earth from the inside)?
    float ndotv = dot(n,v);
    if (ndotv < 0.0 - epsilon)
        return vec3(1, 0, 0);
    
    // vector from light to current point
    vec3 l = normalize(light.direction);
    
    // cos of angle between light and surface. 
    float ndotl = dot(n,-l);

    // in debug mode draw a green line seperating day and night with a width of 3 degrees
    if (debugOn && radians(88.5) <= acos(abs(ndotl))) {
        return vec3(0.0, 1.0, 0.0);
    }

    // in debug draw striped texture
    if (debugOn && mod(texCoords[0], 2.0/numDebugStripes) >= 1.0/numDebugStripes) {
        ambient *= debugFactor;
    }

    vec3 nightColor = vec3(0.0, 0.0, 0.0);
    if (nightTexOn) {
        nightColor = nightFactor * texture2D(nightTex, texCoords).rgb;
    }
    if (ndotl <= 0.0) { // shadow / facing away from the light source
        return ambient + nightColor;
    }

    vec3 diffuse = light.color * ndotl; // diffuse contribution
    if (dayTexOn) {
        diffuse *= dayFactor * texture2D(dayTex, texCoords).rgb;
    } else {
        diffuse *= material.diffuse;
    }
    
    if (nightTexOn) { // dusk
        float angle = 90.0 - degrees(acos(ndotl));
        if (angle < duskAngle) {
            float f = angle / duskAngle;
            diffuse = nightColor * (1.0 - f) + diffuse * f; // FALSCH: das ist nur "diffuse", kein return hier!!!!
        }
    }

    // reflected light direction = perfect reflection direction
    vec3 r = reflect(l,n);
    
    // angle between reflection dir and viewing dir
    float rdotv = max( dot(r,v), 0.0);
    
    // specular contribution
    vec3 specular = material.specular * light.color * pow(rdotv, material.shininess);

    // return sum of all contributions
    return ambient + diffuse + specular;
    
}

void main() {
    
    // normalize normal after projection
    vec3 normalEC = normalize(ecNormal);
    
    // do we use a perspective or an orthogonal projection matrix?
    bool usePerspective = projectionMatrix[2][3] != 0.0;
    
    // for perspective mode, the viewing direction (in eye coords) points
    // from the vertex to the origin (0,0,0) --> use -ecPosition as direction.
    // for orthogonal mode, the viewing direction is simply (0,0,1)
    vec3 viewdirEC = usePerspective? normalize(-ecPosition.xyz) : vec3(0,0,1);
    
    // calculate color using phong illumination
    vec3 color = phong( ecPosition.xyz, normalEC, viewdirEC,
                        light, material );

    gl_FragColor = vec4(color, 1.0);
    
}
