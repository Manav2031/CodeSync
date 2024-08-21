<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import { SocketEvent } from "@/types/socket";
import { USER_STATUS, User } from "@/types/user";
=======
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
import SplitterComponent from "@/components/SplitterComponent";
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage";
import Sidebar from "@/components/sidebar/Sidebar";
import WorkSpace from "@/components/workspace";
<<<<<<< HEAD
import Draggable from 'react-draggable';
=======
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import useFullScreen from "@/hooks/useFullScreen";
import useUserActivity from "@/hooks/useUserActivity";
import { SocketEvent } from "@/types/socket";
import { USER_STATUS, User } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Draggable from "react-draggable";

// FontAwesome Icons
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

function EditorPage() {
<<<<<<< HEAD
=======
    // Listen user online/offline status
    useUserActivity();
    // Enable fullscreen mode
    useFullScreen();
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { status, setCurrentUser, currentUser } = useAppContext();
    const { socket } = useSocket();
    const location = useLocation();
<<<<<<< HEAD
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [slideIn, setSlideIn] = useState(false);
    const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
=======
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);

    const [slideIn, setSlideIn] = useState(false); // State to control sliding
    const [stream, setStream] = useState(null); // Store the media stream
    const [isVideoOn, setIsVideoOn] = useState(true); // State for video toggle
    const [isMicOn, setIsMicOn] = useState(true); // State for microphone toggle
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df

    useEffect(() => {
        setTimeout(() => setSlideIn(true), 100); // Delay the slide to make it smooth
    }, []);

    useEffect(() => {
        if (currentUser.username.length > 0) return;
        const username = location.state?.username;
        if (username === undefined) {
            navigate("/", {
                state: { roomId },
            });
        } else if (roomId) {
            const user: User = { username, roomId };
            setCurrentUser(user);
            socket.emit(SocketEvent.JOIN_REQUEST, user);
        }
<<<<<<< HEAD
    }, [currentUser.username, location.state?.username, navigate, roomId, setCurrentUser, socket]);

=======
    }, [
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ]);

    // Request microphone and camera access
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
    useEffect(() => {
        const getMediaStream = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setStream(userStream);
<<<<<<< HEAD
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userStream;
                }

                socket.on(SocketEvent.ADD_STREAM, (data) => {
                    const { stream: incomingStream, socketId } = data;
                    const pc = peerConnections.get(socketId);
                    if (pc) {
                        incomingStream.getTracks().forEach((track: MediaStreamTrack) => {
                            pc.addTrack(track, incomingStream);
                        });

                        let videoElement = document.getElementById(`remote-${socketId}`) as HTMLVideoElement;
                        if (!videoElement) {
                            videoElement = document.createElement('video');
                            videoElement.id = `remote-${socketId}`;
                            videoElement.autoplay = true;
                            videoElement.style.width = '200px';
                            videoElement.style.height = '150px';
                            videoElement.style.position = 'absolute';
                            videoElement.style.border = '1px solid black';
                            videoElement.style.borderRadius = '8px';
                            document.body.appendChild(videoElement);
                        }
                        videoElement.srcObject = incomingStream;
                    } else {
                        console.log(`Peer connection for ${socketId} not found`);
                    }
                });

                socket.on(SocketEvent.SIGNAL_ICE_CANDIDATE, (data) => {
                    const { candidate, socketId } = data;
                    const pc = peerConnections.get(socketId);
                    if (pc) {
                        pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } else {
                        console.log(`Peer connection for ${socketId} not found`);
                    }
                });

                socket.on(SocketEvent.REMOVE_STREAM, (data) => {
                    const { socketId } = data;
                    const pc = peerConnections.get(socketId);
                    if (pc) {
                        pc.getSenders().forEach((sender) => {
                            pc.removeTrack(sender);
                        });
                        const videoElement = document.getElementById(`remote-${socketId}`) as HTMLVideoElement;
                        if (videoElement) {
                            videoElement.remove();
                        }
                    } else {
                        console.log(`Peer connection for ${socketId} not found`);
                    }
                });

=======
                if (videoRef1.current) {
                    videoRef1.current.srcObject = userStream;
                }
                if (videoRef2.current) {
                    videoRef2.current.srcObject = userStream;
                }
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
            } catch (error) {
                console.error("Error accessing media devices.", error);
            }
        };

        getMediaStream();
<<<<<<< HEAD

        return () => {
            socket.off(SocketEvent.ADD_STREAM);
            socket.off(SocketEvent.SIGNAL_ICE_CANDIDATE);
            socket.off(SocketEvent.REMOVE_STREAM);
        };
    }, [socket, peerConnections]);

    useEffect(() => {
        const createPeerConnection = (socketId: string) => {
            const pc = new RTCPeerConnection();
            peerConnections.set(socketId, pc);
            setPeerConnections(new Map(peerConnections));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit(SocketEvent.SIGNAL_ICE_CANDIDATE, {
                        candidate: event.candidate,
                        roomId,
                    });
                }
            };

            stream?.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            return pc;
        };

        socket.on(SocketEvent.JOIN_REQUEST, async (data) => {
            const { socketId } = data;
            const pc = createPeerConnection(socketId);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit(SocketEvent.SIGNAL_OFFER, {
                offer,
                roomId,
            });
        });

        socket.on(SocketEvent.SIGNAL_OFFER, async (data) => {
            const { offer, socketId } = data;
            const pc = createPeerConnection(socketId);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit(SocketEvent.SIGNAL_ANSWER, {
                answer,
                roomId,
            });
        });

        socket.on(SocketEvent.SIGNAL_ANSWER, async (data) => {
            const { answer, socketId } = data;
            const pc = peerConnections.get(socketId);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } else {
                console.log(`Peer connection for ${socketId} not found`);
            }
        });

        return () => {
            socket.off(SocketEvent.JOIN_REQUEST);
            socket.off(SocketEvent.SIGNAL_OFFER);
            socket.off(SocketEvent.SIGNAL_ANSWER);
        };
    }, [socket, stream, peerConnections, roomId]);

=======
    }, []);

    // Toggle Video On/Off
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

<<<<<<< HEAD
=======
    // Toggle Microphone On/Off
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />;
    }

    return (
        <div
            style={{
                transform: slideIn ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.5s ease-in-out",
                height: "100vh",
                width: "100vw",
            }}
        >
            <SplitterComponent>
                <Sidebar />
                <WorkSpace />
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1001, display: 'flex', gap: '10px' }}>
                        {/* Video and Mic Toggle Icons */}
<<<<<<< HEAD
                        <FontAwesomeIcon
                            icon={isVideoOn ? faVideo : faVideoSlash}
                            onClick={toggleVideo}
                            style={{ fontSize: '24px', cursor: 'pointer', color: isVideoOn ? 'green' : 'red' }}
                        />
                        <FontAwesomeIcon
                            icon={isMicOn ? faMicrophone : faMicrophoneSlash}
                            onClick={toggleMic}
                            style={{ fontSize: '24px', cursor: 'pointer', color: isMicOn ? 'green' : 'red' }}
                        />
                    </div>

                    {/* Local Video Window */}
                    <Draggable>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            style={{ width: '200px', height: '150px', position: 'absolute', border: '1px solid black', borderRadius: '8px' }}
                        />
=======
                        <FontAwesomeIcon 
                            icon={isVideoOn ? faVideo : faVideoSlash} 
                            onClick={toggleVideo} 
                            style={{ fontSize: '24px', cursor: 'pointer', color: isVideoOn ? 'green' : 'red' }} 
                        />
                        <FontAwesomeIcon 
                            icon={isMicOn ? faMicrophone : faMicrophoneSlash} 
                            onClick={toggleMic} 
                            style={{ fontSize: '24px', cursor: 'pointer', color: isMicOn ? 'green' : 'red' }} 
                        />
                    </div>

                    {/* First Video Window */}
                    <Draggable>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexGrow: 1 }}>
                            <video 
                                ref={videoRef1} 
                                autoPlay 
                                muted 
                                style={{ 
                                    width: 'auto',  
                                    height: 'auto',  
                                    zIndex: 1000,  
                                    borderRadius: '8px',  
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',  
                                    cursor: 'move',  
                                    margin: '20px',  
                                }} 
                            />
                        </div>
                    </Draggable>

                    {/* Second Video Window */}
                    <Draggable>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexGrow: 1 }}>
                            <video 
                                ref={videoRef2} 
                                autoPlay 
                                muted 
                                style={{ 
                                    width: 'auto',  
                                    height: 'auto',  
                                    zIndex: 1000,  
                                    borderRadius: '8px',  
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',  
                                    cursor: 'move',  
                                    margin: '20px',  
                                }} 
                            />
                        </div>
>>>>>>> 770829d5e38e1fc7c788bd8cc849673f30faf3df
                    </Draggable>
                </div>
            </SplitterComponent>
        </div>
    );
}

export default EditorPage;
