import React, {useState, useEffect} from 'react'
import * as faceapi from 'face-api.js'
import Loader from './Loader'
import { loadRecognizedImages } from '../functions/recognizedImages'

export const FaceApiRecognition = ()=>{
const [loading, setloading] = useState(false)
const [error, seterror] = useState(null)


useEffect(() => {
    const preparingModels= async ()=>{
        setloading(true)
        Promise.all([
            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models')   
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

    const labeledFaceDescriptors = await loadRecognizedImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)
    detections.forEach(faceDetected => {
        const bestMatch = faceMatcher.findBestMatch(faceDetected.descriptor)
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
if (error) return(<div>{error.message}</div>)

return (
    <div id="myContainer" style={{position:'relative', border: '10px solid red'}}>
        { loading ? <div><Loader/></div>:null } 
        <img id="myImg" src="/images/test_images/5.jpg" alt=""/>
    </div>
)
}