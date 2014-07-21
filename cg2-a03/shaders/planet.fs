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
uniform bool redGreenOn;
uniform bool glossMapOn;
uniform bool cloudsOn;

const float epsilon = 0.1;
const float numDebugStripes = 24.0;
const float debugFactor = 2.0;
const float dayFactor = 1.4;
const float nightFactor = 0.9;
const float duskAngle = 15.0;

// textures for the planet surface
uniform sampler2D dayTex;
uniform sampler2D nightTex;
uniform sampler2D baryTex;
uniform sampler2D topoTex;
uniform sampler2D cloudsTex;

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
    if (redGreenOn || glossMapOn) {
        float baryVal = texture2D(baryTex, texCoords).r;
        if (redGreenOn) {
            return (baryVal >= epsilon) ? vec3(baryVal, 0.0, 0.0) : vec3(0.0, texture2D(topoTex, texCoords).r, 0.0);
        }
        if (baryVal < epsilon) {
            material.shininess /= 10.0;
            material.specular /= 5.0;
        }
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

    float cloudsVal = cloudsOn ? texture2D(cloudsTex, texCoords).r : 0.0;

    vec3 nightColor = nightTexOn ? nightFactor * texture2D(nightTex, texCoords).rgb : vec3(0.0, 0.0, 0.0);
    nightColor -= cloudsVal * 0.5; // clouds darken the night for 50%
    
    // shadow / facing away from the light source
    if (ndotl <= 0.0) {
        return ambient + nightColor;
    }

    // diffuse contribution
    vec3 mat = dayTexOn ? dayFactor * texture2D(dayTex, texCoords).rgb : material.diffuse;
    mat = mat * (1.0 - cloudsVal) + cloudsVal;
    vec3 diffuse = mat * light.color * ndotl;
    
    // dusk
    if (nightTexOn) {
        float angle = 90.0 - degrees(acos(ndotl));
        if (angle < duskAngle) {
            float f = angle / duskAngle;
            diffuse = nightColor * (1.0 - f) + diffuse * f;
        }
        // diffuse = nightColor * (1.0 - pow(ndotl, 0.1)) + diffuse * pow(ndotl, 0.1); // Variante: Ueberblendung ueber die gesamte Halbkugel
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
