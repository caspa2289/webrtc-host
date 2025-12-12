let candidateDescription = null

let dataChannel = null

const handleMessage = (event) => {
    console.log(new Float64Array(event.data))
}

const init = async () => {
    const connection = new RTCPeerConnection()

    dataChannel = await connection.createDataChannel('test channel')

    dataChannel.onmessage = handleMessage

    const offer = await connection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
    })

    await connection.setLocalDescription(offer)

    connection.onconnectionstatechange = async (state) => {
        console.log(state.currentTarget.connectionState)
    }

    connection.onicecandidate = (event) => {
        console.log(event.candidate)
        if (event.candidate && !candidateDescription) {
            connection.addIceCandidate(event.candidate)
            candidateDescription = event.candidate.candidate

            console.log(
                JSON.stringify(connection.localDescription) +
                    'POOPY_BALLS' +
                    candidateDescription
            )
        }
    }

    return connection
}

const handleInput = async (peerData, connection) => {
    const [jsonString, candidate] = peerData.split('POOPY_BALLS')
    const desc = JSON.parse(jsonString)

    await connection.setRemoteDescription(desc)

    await connection.addIceCandidate({
        candidate,
        sdpMLineIndex: 0,
        sdpMid: '0',
    })
}

init().then((connection) => {
    document.getElementById('button').addEventListener('click', () => {
        handleInput(document.getElementById('input').value, connection)
    })
    document.getElementById('buzz').addEventListener('click', () => {
        dataChannel?.send('buzz buzz')
    })
})
