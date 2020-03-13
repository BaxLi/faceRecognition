import * as faceapi from 'face-api.js'
export const loadRecognizedImages=()=> {

    const labels = [ 'Livika','Alina Baxan','Victor Baxan','Evelina Baxan','Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark' ]
    return Promise.all(
        labels.map( async ( label ) => {
            const descriptions=[]
            for ( let i = 1; i <= 6; i++ ) 
            {
                try {
                    const img = await faceapi.fetchImage(`/images/labeled_images/${label}/${i}.jpg`)
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                    descriptions.push(detections.descriptor)
                } catch (error) {}

            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}
