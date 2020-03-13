import React, {useState, useEffect} from 'react'
import * as faceapi from 'face-api.js'
import Loader from './Loader'

export const FaceApiRecognition = ()=>{
const [loading, setloading] = useState(false)
const [error, seterror] = useState(null)

// const imageToAnalyze=require('../test_images/2.jpg')
// const img=await faceapi.fetchImage('../test_images/2.jpg')
// console.log("img=", img)

// const detectionStep=async ()=>{
//     const detections = await faceapi.detectAllFaces(img).withFaceLandmarks()
//     console.log("detected!",detections);
// }
const preparingModels= async ()=>{
    setloading(true)
    Promise.all([
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models')   
    ])
    .then(()=>{ 
        findFacesOnImage()
        setloading(false)
    })
    .catch(
        (e)=>{
            setloading(false)
            seterror({err:e, message:'error on preparing stage'})
        })
}
useEffect(() => {
    setloading(true)
    preparingModels()
    },[])

const findFacesOnImage= async ()=>{
    const img=document.getElementById('myImg')
    const detections  = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
    console.log("detections", detections); 
    // create FaceMatcher with automatically assigned labels
    // from the detection results for the reference image
    const container = document.getElementById('myContainer')
    container.style.position = 'relative'

    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    detections.forEach(fd => {
        const bestMatch = faceMatcher.findBestMatch(fd.descriptor)
        console.log(bestMatch.toString())
      })  

      const canvas = faceapi.createCanvasFromMedia(img)
    //   console.log("canvas=", canvas);
      container.append(canvas)
    // const displaySize = { width: img.width, height:img.height}
    // faceapi.matchDimensions(canvas,displaySize)
    // const resizedDetections = faceapi.resizeResults(detections, displaySize)
    // console.log("resizedDetections",resizedDetections);
    // faceapi.draw.drawDetections(canvas, detections)

    const results=[]
    detections.forEach(face=>{
        const temp=faceMatcher.findBestMatch(face.descriptor)
        const box=face.detection.box
        const drawBox=new faceapi.draw.DrawBox(box,{label:temp})
        drawBox.draw(canvas)
        results.push({face:face, label:temp})
    }) 
    console.log("results = ",results);
    
}
    function loadLabeledImages() {
        const labels = [ 'Victor Baxan','Evelina Baxan','Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark' ]
        return Promise.all(
            labels.map( async ( label ) => {
                const descriptions=[]
                for ( let i = 1; i <= 2; i++ ) 
                // @ts-ignore
                {
                    const img = await faceapi.fetchImage(`/images/labeled_images/${label}/${i}.jpg`)
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                        console.log(label)
                    descriptions.push(detections.descriptor)
                   
                }
                return new faceapi.LabeledFaceDescriptors(label, descriptions)
            })
        )
    }

if (error) return(<div>{error.message}</div>)

return (
    <div id="myContainer" style={{position:'relative', border: '10px solid red'}}>
        { loading ? <div><Loader/></div>:null } 
        <img id="myImg" src="/images/test_images/4.jpg" alt=""/>
    </div>
)
}