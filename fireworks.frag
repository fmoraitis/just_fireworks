#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define NUM_PARTICLES 80.
#define NUM_EXPLOSIONS 7.
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_time;
uniform bool u_heardAGunSound;
//uniform float u_NUM_PARTICLES;
uniform float u_NUM_EXPLOSIONS;
vec2 Hash12(float v){
    //the t here is the seed so for the same seed i get back
    //the same number
    float x=fract(sin(v*674.3)*453.2);//goes from 0.0 to 0.9
    float y=fract(sin((v+x)*714.3)*263.2);//goes from 0.0 to 0.9
    return vec2(x,y);
}
vec2 Hash12_Polar(float v){
    float a=fract(sin(v*674.3)*453.2)*6.2832;// 6.2832 is 2PI so
    //the expression fract(sin(t*674.3)*453.2) goes from 0 to 1 then the a
    //goes from 0 to 2PI
    float d=fract(sin((v+a)*714.3)*263.2);// goes from 0 to 1
    return vec2(sin(a),cos(a))*d;// so i get a number from -d to d
}

float Explosion(vec2 my_uv,float time){
    float a_pixel=0.;
    
    for(float i=0.;i<NUM_PARTICLES;i++){
        
        // vec2 dir=Hash12(i+0.2)-.5;
        vec2 dir=Hash12_Polar(i+1.)*0.8;
        //vec2 dir =vec2(0);
        //THIS IS THE MEAT OF THE PROGRAMM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        // in the main program we have make a new mapp of coordinates and the
        //previous 0.5 , 0.5 is the new 0.0 0.0  by doing this uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
        //so what the for loop does is: eg lets say that we have 2 particles
        // in each for loop the and for every pixel in screen and for a specific time t
        // we have the following snapshot: each iteratation of the loop remaps the coordinates
        // starting from the 0,0 each time, so if we have 2 particles we get the same  2
        // new coorinates starts  from the 0.0 for every pixel. There are the same bacause
        // the seed to get the the 2 different dirs is every time the mumber of the itteration
        // so lets say tha the two dir vector that we get from the Hash12_Polar is the (0.2,0.2) and (-0.1,0.1)
        //these two dir vector are going to be the same for every pixel of the screen and the brightness of
        // each pixel eg the  (uv.x1,uv.y1) is depenndet how close is to these new coordinates center ((-0.2,-0.2)), ((0.1,-0.1))
        // and we add the contibution from the closeness  of every new coordinate system that have at that
        // specific pixel in other word from every loop itteration to the variable a_firework with this a_firework+=brightness/d;
        
        //what the t does:
        // t=1 we have reachead the new origin uv-dir*t because the funtction length
        //t=0 we are at (uv.x,uv.y)
        // so by mult by t we get our animation for each of the particle
        float d=length(my_uv-dir*time*1.2);
        
        // if smoothstep left edge is higher than the right
        // then it goes from   1 to 0 so at first is one and then is zero
        // so brigthenss is 0.001 and after t.>0.5 the brightness goes to 0.00005
        // so this is responsible fro the start of the explosion that goes from bright to
        //less bright
        float brightness=mix(.0005,.001,smoothstep(.8,0.,time));
     // brightness=.001;
        
        // i also want to turn on and off the particles so i multiply tne
        // brightness with a sin. The sin goes from -1 to 1 so in order to
        // map it from 0 to 1 i first multiply with 0.5 so now goes from
        // -0.5 to 0.5 and if i as 0.5 goes from 0 to 1
        //this oscilates the current brightness whichever that
       // brightness*=sin(time*20.+i)*.5+.5;
        
        // with the smoothstep (with reversed the left edge and right)
        // so it goes from 1 to 0 it is like i say till 0.6 multiply brightenns with 1
        // so in other words dont do nothing afrer 0.6 start fading to zero
        // so this is responsible for the end of the explosion that the particles do not didhapear 
        // abruptly but start fading from 0.6 to 1 
        //brightness*=smoothstep(1.,.6,time);
        a_pixel+=brightness/d;
    }
    
    return a_pixel;
}
void main(){
    float minres = min(u_resolution.x,u_resolution.y);
    float maxres=max(u_resolution.x,u_resolution.y);
    vec2 uv=(gl_FragCoord.xy-u_resolution.xy)/ minres;// moves the center at middle of screen
    //vec2 uv=(gl_FragCoord.xy-(u_center.xy + 0.5 * u_resolution.xy))/ minres;;
    vec3 col=vec3(0);
    for(float i=0.;i<NUM_EXPLOSIONS;i++){
         if (i >= u_NUM_EXPLOSIONS){break;} 
         float t=u_time+i/u_NUM_EXPLOSIONS;
        // A note here on floor ans fract
        //floor(u_time) is like frameCount
        //fract(u_time) is like getting a continuous counter from 0 to 1
        // This sin(*vec3(.34,.12,.56)*floor(u_time))*.25+.75   maps from 0.5 to 1 so i dont get
        // darker colors that are <0.5
        //i multiply with a large number eg 4 in order to be sure i get
        //larger steps of deigmatolipsia so i get for sure different colors
        // if i put a small number eg 0.1 i will get the same color alla the time
        //the color changes once per explosion that is why we use the floor(u_time)
        //which gives us a different time inside each loop itteration
        vec3 randColor=sin(4.*vec3(.34,.12,.56)*floor(t))*.25+.75;
       
        //here also  the floor(t) gives a different seed and therefore deifferent possition
        // for each loop iterration and also for the next time the loop will run it will give us
        // different seed unlike the for loop inside the function Explosion which uses 
        // only the itteration number for seed so although is different for each itteration
        //it is the same for each time the loop runs again
        vec2 offset=Hash12(i+1.+floor(t)*NUM_EXPLOSIONS)-.5;// we subtract 0.5 in odrer
        //to get negative numbers too because Hasdh12 returns from 0 to 1
        //so the offset will be now between -0.5 to 0.5
        
        // i multply with the vec(u_resolution.x/u_resolution.y,1.)
        //
        if (u_resolution.x>u_resolution.y){offset*=vec2(maxres/minres,1.);}
        else {offset*=vec2(1.,maxres/minres);}
        //offset*=vec2(maxres/minres,1.);
        //col+=Explosion(uv,u_time)*randColor;
        //col+=.001/length(uv-offset);
        // t variable goes from 0 to 1 because we take the fractional part of the time
        
        col+=Explosion(uv-offset,fract(t))*randColor;
        
    }
    if (u_heardAGunSound==true){
        gl_FragColor=vec4(0.0,0.0,0.0,1.);
    }
    else{gl_FragColor=vec4(col,1.);}
    
}