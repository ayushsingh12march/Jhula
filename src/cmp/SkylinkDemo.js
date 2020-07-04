import React, { Component } from 'react';
import {
  Container,
  Grid,
  Form,
  Button,
  Header,
  Segment,
  Accordion,
  Modal,
  Dropdown,
  Checkbox
} from 'semantic-ui-react';
import Skylink, { SkylinkLogger, SkylinkEventManager, SkylinkEvents, SkylinkConstants } from 'skylinkjs';
import HelperSocket from './HelperSocket';

SkylinkLogger.setLevel(SkylinkLogger.logLevels.DEBUG);

class SkylinkDemo extends Component {
  constructor(props) {
    super(props);
    global.Skylink = Skylink;
    this.skylink = new Skylink({
      appKey: '5d73aa38-148c-45e9-bf69-f84e8df2d8d9', 
      defaultRoom: 'GogabE'//getRoomId();
    });
    global.SkylinkDemo = this.skylink;
    this.skylinkEventManager = SkylinkEventManager;
    this.helperSocket = new HelperSocket();
    this.helperSocket.initRegisterEvtLoggers();
    this.state = {
          room1: {
        username: '',
        peerId: '',
        inRoom: false,
        showLoader: false,
        message: '',
        messages: [],
        title: 'Room 1',
        remotePeers: [],
        selectedPeers: [],
        messageChannel: 'P2P',
        roomLocked: false,
        streamMuted: {
          videoMuted: false,
          audioMuted: false,
        }
      },
      registeredEvts: this.helperSocket.registeredEvts,
    };

    this.prefetchedStream = null;

    this.localFeedRef = React.createRef();
    // this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.lockRoom = this.lockRoom.bind(this);
    this.userNameEntered = this.userNameEntered.bind(this);
    this.onIncomingStream = this.onIncomingStream.bind(this);
    this.onPeerJoined = this.onPeerJoined.bind(this);
    this.onRoomLocked = this.onRoomLocked.bind(this);
    this.onIncomingMessage = this.onIncomingMessage.bind(this);
    this.messageEntered = this.messageEntered.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.onPeerLeft = this.onPeerLeft.bind(this);
    this.shareScreen = this.shareScreen.bind(this);
    this.shareScreenReplace = this.shareScreenReplace.bind(this);
    this.onStreamEnded = this.onStreamEnded.bind(this);
    this.getUserMedia = this.getUserMedia.bind(this);
    this.stopStream = this.stopStream.bind(this);
    this.stopScreen = this.stopScreen.bind(this);
    this.onPeerSelected = this.onPeerSelected.bind(this);
    this.onMessageChannelSelected = this.onMessageChannelSelected.bind(this);
    this.onSystemAction = this.onSystemAction.bind(this);
    this.prefetchGetUserMedia = this.prefetchGetUserMedia.bind(this);
    this.onIncomingScreenStream = this.onIncomingScreenStream.bind(this);
    this.getPeersStream = this.getPeersStream.bind(this);
    this.getPeers = this.getPeers.bind(this);
    this.toggleAudioVideo = this.toggleAudioVideo.bind(this);


    this.skylinkEventManager.addEventListener(SkylinkEvents.ON_INCOMING_STREAM, this.onIncomingStream); //
    this.skylinkEventManager.addEventListener(SkylinkEvents.PEER_LEFT, this.onPeerLeft);
    this.skylinkEventManager.addEventListener(SkylinkEvents.ON_INCOMING_MESSAGE, this.onIncomingMessage);
    this.skylinkEventManager.addEventListener(SkylinkEvents.PEER_JOINED, this.onPeerJoined);
    this.skylinkEventManager.addEventListener(SkylinkEvents.HANDSHAKE_PROGRESS, this.handshakeProgress);
    this.skylinkEventManager.addEventListener(SkylinkEvents.STREAM_ENDED, this.onStreamEnded);
    this.skylinkEventManager.addEventListener(SkylinkEvents.SYSTEM_ACTION, this.onSystemAction);
    this.skylinkEventManager.addEventListener(SkylinkEvents.ROOM_LOCK, this.onRoomLocked);
    this.skylinkEventManager.addEventListener(SkylinkEvents.ON_INCOMING_SCREEN_STREAM, this.onIncomingScreenStream);
    this.skylinkEventManager.addEventListener(SkylinkEvents.ON_INCOMING_SCREEN_STREAM, this.onIncomingScreenStream);
  }
  joinRoom = (location) =>{
    const locationState = Object.assign({}, this.state[location]);
    const joinRoomOptions = {
      audio: !locationState.streamMuted.audio,
      video: !locationState.streamMuted.video,
      roomName: location,
      userData: {
        username: locationState.username
      },
    };

    locationState.showJoinRoomLoader = true;
    this.setState({ [location]: locationState });

    this.skylink.joinRoom(joinRoomOptions, this.prefetchedStream).then((streams) => {

      const locationState = Object.assign({}, this.state[location]);
      locationState.inRoom = true;
      locationState.showJoinRoomLoader = false;

      this.setState({ [location]: locationState }, () => {
        const localFeedElem = document.getElementById(`local-feed_${location}`);
        streams.forEach((stream) => {
          if (stream.getVideoTracks().length > 0) {
            window.attachMediaStream(localFeedElem, stream);
          }
       })
      });
    }).catch((error) => {
    });
  }

  sendMessage(location) {
    const message = this.state[location]['message'];
    const selectedPeers = this.state[location]['selectedPeers'];
    const messageChannel = this.state[location]['messageChannel'];
    if (messageChannel === 'P2P') {
      this.skylink.sendP2PMessage(message, selectedPeers, location);
    } else {
      this.skylink.sendMessage(location, message, selectedPeers);
    }
  }

  getPeers(location) {
    this.skylink.getPeers(location, true)
      .then((result) => {
      })
      .catch((error) => {
      })
  }

  getPeersStream(location) {
  }

  
  shareScreen(location) {
    this.skylink.shareScreen(location, false).then((screenStream) => {
      window.attachMediaStream(document.getElementById(`local-feed_screen_${location}`), screenStream);
    });
  }

 

  prefetchGetUserMedia() {
    this.skylink.getUserMedia({ audio: false, video: true }).then((stream) => {
      this.prefetchedStream = stream;
    }).catch((error) => { });
  }

  stopScreen(location) {
    this.skylink.stopScreen(location);
  }

  stopStream(location) {
    const streamList = this.skylink.getStreams(location);
    if(streamList.userMedia) {
      const streamIds = Object.keys(streamList.userMedia);
      this.skylink.stopStream(location);
    }
  }

  leaveRoom(location) {
    this.skylink.leaveRoom(location)
      .then(() => {
        const locationState = this.state[location];
        locationState.remotePeers = [];
        this.setState({ [location]: locationState });
        this.removeFeed(location)
      })
      .catch((error) => {
        this.removeFeed(location)
      });
  }

  
  lockRoom(location) {
    if (this.state[location].roomLocked) {
      this.skylink.unlockRoom(location);
    } else {
      this.skylink.lockRoom(location);
    }
  }
  
  shareScreenReplace(location) {
    const streamList = this.skylink.getStreams(location);
    const streamIds = Object.keys(streamList.userMedia);
    this.skylink.shareScreen(location, true).then((screenStream) => {
      window.attachMediaStream(document.getElementById(`local-feed_screen_${location}`), screenStream);
    });
  }

  removeFeed(location) {
    let localFeedElem = document.getElementById(`local-feed_${location}`)
    if (localFeedElem) {
      localFeedElem.srcObject = null;
    }

    const locationState = Object.assign({}, this.state[location]);

    locationState.inRoom = false;
    this.setState({ [location]: locationState });
  }

  userNameEntered(location, ev) {
    const locationState = Object.assign({}, this.state[location]);
    locationState.username = ev.target.value;
    this.setState({ [location]: locationState });
  }

  onStreamEnded(evt) {
    const detail = evt.detail;
    const { isSelf, isScreensharing, room, peerId } = detail;

    if(isSelf) {
      if (isScreensharing) {
        const localVideoScreenElem = document.getElementById(`local-feed_screen_${room.roomName}`);
        localVideoScreenElem.srcObject = null;
      } else {
        const localVideoElem = document.getElementById(`local-feed_${room.roomName}`);
        localVideoElem.srcObject = null;
        localVideoElem.style.display = 'none';
    
      }
    } else {
      const remoteStreams = this.skylink.getPeersStream(room.roomName, false);
      if (remoteStreams) {
        if (isScreensharing) {
          const remoteVideoScreenElem = document.getElementById(`remote-feed_screen_${peerId}_${room.roomName}`);
          if (remoteVideoScreenElem) {
            remoteVideoScreenElem.srcObject = null;
          }
        } else {
          const remoteVideoElem = document.getElementById(`remote-feed_${peerId}_${room.roomName}`);
          if (remoteVideoElem.srcObject.active !== true){
            remoteVideoElem.srcObject = null;
            remoteVideoElem.style.display = 'none';
          }
          const remotePlaceholder = document.getElementById(`remote-feed_icon_${room.roomName}`);
          if (remotePlaceholder && remoteVideoElem.srcObject && remoteVideoElem.srcObject.active !== true){
            remotePlaceholder.style.display = 'inline';
          }
        }
      } else {
          const remoteVideoScreenElem = document.getElementById(`remote-feed_screen_${peerId}_${room.roomName}`);
          if (remoteVideoScreenElem) {
            remoteVideoScreenElem.srcObject = null;
          }
          const remoteVideoElem = document.getElementById(`remote-feed_${peerId}_${room.roomName}`);
          if (remoteVideoElem && remoteVideoElem.srcObject){
            remoteVideoElem.srcObject = null;
            remoteVideoElem.style.display = 'none';
          }
          const remotePlaceholder = document.getElementById(`remote-feed_icon_${room.roomName}`);
          if (remotePlaceholder) {
            remotePlaceholder.style.display = 'inline';
          }
      }
    }
  }

  onSystemAction(evt) {
    if (evt.detail.reason === SkylinkConstants.SYSTEM_ACTION.LOCKED) {
      alert('Room is locked.')
    }
  }

  onRoomLocked(evt) {
    const { isLocked, peerInfo } = evt.detail;
    const roomName = peerInfo.room;
    const locationState = Object.assign({}, this.state[roomName]);
    locationState.roomLocked = isLocked;
    this.setState({ [roomName]: locationState });
  }

  onIncomingScreenStream(evt) {
    const props = evt.detail;
    const { room, peerId, stream, isSelf } = props;

    if (isSelf) {
      const localVideoScreenElem = document.getElementById(`local-feed_screen_${room.roomName}`);
      window.attachMediaStream(localVideoScreenElem, stream);
    } else {
      const remoteVideoScreenElem = document.getElementById(`remote-feed_screen_${peerId}_${room.roomName}`);
      window.attachMediaStream(remoteVideoScreenElem, stream);
    }
  }

  onIncomingStream(evt) {
    const props = evt.detail;
    const { stream, isSelf, peerId, room, isReplace, streamId, isVideo, isAudio } = props;

    if (!isSelf && !isReplace) {
      if ((isAudio && isVideo) || (isVideo && !isAudio)) {
        const remoteVideoElem = document.getElementById(`remote-feed_${peerId}_${room.roomName}`);
        const remotePlaceholder = document.getElementById(`remote-feed_icon_${room.roomName}`);
        window.attachMediaStream(remoteVideoElem, stream);
        remoteVideoElem.style.display = 'inline';
        remotePlaceholder.style.display = 'none';
      } else {
        const rremoteAudioElem = document.getElementById(`remote-feed_audio_${peerId}_${room.roomName}`);
        window.attachMediaStream(rremoteAudioElem, stream);
      }
    }
  }

  messageEntered(location, ev) {
    const locationState = Object.assign({}, this.state[location]);
    locationState.message = ev.target.value;
    this.setState({ [location]: locationState });
  }

  onPeerJoined(evt) {
    const eventDetail = evt.detail;
    const { isSelf, peerId, room } = eventDetail;
    const location = Object.assign([], this.state[room.roomName]);

    if (!isSelf) {
      location.remotePeers.push(peerId);
    } else {
      location.peerId = peerId;
    }

    this.setState({ [room.roomName]: location });
  }

  onIncomingMessage(evt) {
    const message = evt.detail;
    const { room } = message;
    const locationState = Object.assign({}, this.state[room.roomName]);
    locationState.messages.push(message);
    this.setState({ [room.roomName]: locationState });
  }

  getUserMedia(location) {
    this.skylink.getUserMedia(location, {
      audio: false,
      video: true,
    })
      .then((stream) => {
      }).catch((error) => {
        console.error(error)
    });
  }

  onPeerLeft(evt) {
    const props = evt.detail;
    const { isSelf, room, peerId } = props;
    const location = Object.assign([], this.state[room.roomName]);

    if (!isSelf){
      const peerIndex = location.remotePeers.indexOf(peerId);
      if (peerIndex !== -1) {
        location.remotePeers.splice(peerIndex, 1);
        this.setState({ [room.roomName]: location });
      }
    } else {
      this.removeFeed(room.roomName);
    }
  }

  onMessageChannelSelected(location, evt, checkbox) {
    const locationState = Object.assign({}, this.state[location]);
    const channel = checkbox.value;
    locationState.messageChannel = channel;
    this.setState({ [location]: locationState });
  }

  onPeerSelected(location, evt, selector) {
    const locationState = Object.assign({}, this.state[location]);
    const selectedPeers = selector.value;
    locationState.selectedPeers = selectedPeers;
    this.setState({ [location]: locationState });
  }

  toggleAudioVideo(location, evt, checkbox) {
    const locationState = Object.assign({}, this.state[location]);
    const streamMuted = {
      audioMuted: checkbox.value === 'audio' ? !checkbox.checked : locationState.streamMuted.audioMuted,
      videoMuted: checkbox.value === 'video' ? !checkbox.checked : locationState.streamMuted.videoMuted,
    };
    locationState.streamMuted = streamMuted;
    this.setState({[location]: locationState });
  }

  render() {
    const {room1} = this.state;
    const segmentArray = [
      {
        stateKey: 'room1',
        buttonText: 'Join  Room 1',
        stateObject: room1,
      },
    ];

    const panels = segmentArray.map((segment, index) => {
      return {
        key: `panel-${index}`,
        title: `${segment.stateObject.title}`,
        content: {
          content: (
            <RoomSegment
          key={index}
          sendMessage={this.sendMessage}
        userNameEntered={this.userNameEntered}
      messageEntered={this.messageEntered}
          toggleAudioVideo={this.toggleAudioVideo}
      joinRoom={this.joinRoom}
      location={segment.stateObject}
      buttonText={segment.buttonText}
      stateKey={segment.stateKey}
          shareScreen={this.shareScreen}
          shareScreenReplace={this.shareScreenReplace}
          getUserMedia={this.getUserMedia}
          leaveRoom={this.leaveRoom}
          stopStream={this.stopStream}
          stopScreen={this.stopScreen}
          RoomSegment={this.RoomSegment}
          onPeerSelected={this.onPeerSelected}
          onMessageChannelSelected={this.onMessageChannelSelected}
          lockRoom={this.lockRoom}
          getPeersStream={this.getPeersStream}
          getPeers={this.getPeers}
      />
    )
    }
    }
    });
    return (
      <div>
        <Accordion styled defaultActiveIndex={[0]} panels={panels} exclusive={false} fluid />
    </div>
  )
  }
}

const UserFormFieldCmp = (props) => {
  const { location, stateKey, buttonText, userNameEntered, joinRoom, toggleAudioVideo } = props;
  return <Grid.Row>
  <Grid.Column width={3}>
    <Form >
    <Form.Field>
    <label>Enter Name</label>
    <input value={location.username} onChange={userNameEntered.bind(this, stateKey)} placeholder='Type your Name' />
    </Form.Field>
    <Button loading={location.showJoinRoomLoader} primary disabled={location.username === ''} onClick={joinRoom.bind(this, stateKey)}>{buttonText}</Button>
      <div style={{ padding: '5px'}}>
        <label style={{ paddingRight: '5px'}}>On Sound</label>
        <Checkbox style={{ verticalAlign: 'middle'}} value={'audio'} checked={!location.streamMuted.audioMuted} onClick={toggleAudioVideo.bind(this, stateKey)}/>
        <br/>
        <label style={{ paddingRight: '5px'}}>On Video</label>
        <Checkbox style={{ verticalAlign: 'middle'}} value={'video'} checked={!location.streamMuted.videoMuted} onClick={toggleAudioVideo.bind(this, stateKey)}/>
      </div>
  </Form>
  </Grid.Column>
  </Grid.Row>
}

const LocalFeedColumn = (props) => {
  const { stateKey, location } = props;
  return <Grid.Column width={6}>
  <Header as='div' attached='top'>
    <Header.Content style={{ padding: '0px' }}>{location.username} ({location.peerId})</Header.Content>
    <Messaging {...props} />
  </Header>
  <Segment attached>
    <video autoPlay muted style={{ width: '100%' }} controls={true} playsInline id={`local-feed_${stateKey}`} />
    <video autoPlay muted style={{ width: '100%' }} controls={true} playsInline id={`local-feed_screen_${stateKey}`} />
    <PublicMethodsForRoom {...props} />
  </Segment>
  </Grid.Column>
}

const RemoteFeedColumn = (props) => {
  const { stateKey, location: { remotePeers } } = props;
  return <Grid.Column width={10}>
  <Header as='div' attached='top'>
    <Header.Content style={{ padding: '0px' }}>Remote Peers</Header.Content>
  </Header>
  <Segment attached>
  <Grid columns={4} padded>
  {
    remotePeers.map((peerId) => {
    return <Grid.Column key={peerId}>
      <label id={`remote-feed_peerId_${peerId}_${stateKey}`}>{peerId}</label>
      <video autoPlay playsInline controls={true} id={`remote-feed_${peerId}_${stateKey}`} style={{ width: '100%' }} />
      <video autoPlay playsInline controls={true} id={`remote-feed_screen_${peerId}_${stateKey}`} style={{ width: '50%' }} />
    <audio autoPlay playsInline id={`remote-feed_audio_${peerId}_${stateKey}`} style={{ width: '50%' }} />
    </Grid.Column>
  })
}
</Grid>
  </Segment>
  </Grid.Column>
}

const Messaging = (props) => {
  const { stateKey, location, sendMessage, messageEntered, onPeerSelected, onMessageChannelSelected } = props;
  const peerSelectorOptions = location.remotePeers.map((remotePeer) => {
    return {
      text: remotePeer,
      value: remotePeer
    }
  });
  return <Modal trigger={<Button primary size='mini' floated='right' style={{ marginTop: '-5px' }}>Messaging</Button>}>
  <Modal.Header>Messaging</Modal.Header>
  <Modal.Content>
  <Modal.Description>
  {
    location.messages.map((message, index) => {
    const { isSelf, peerInfo, message :{content, isPrivate, isDataChannel }} = message;
    let toPrint = isSelf ? 'You:' : `${peerInfo.userData.username}:`;
    const channelUsed = isDataChannel ? 'P2P' : 'SIG';
    toPrint += ` [${isPrivate ? `Private | ${channelUsed} |` : `Public | ${channelUsed} |`}]`;
    toPrint += ` ${content}`;
    return <p key={index}>
      {toPrint}
      </p>
  })
}
<Form>
  <Form.Field>
    <Grid>
      <Grid.Column width={12}>
        <label>Select Peer</label>
        <Dropdown placeholder='Select Peer' multiple fluid selection options={peerSelectorOptions} onChange={onPeerSelected.bind(this, stateKey)} />
      </Grid.Column>
      <Grid.Column width={4}>
        <Form>
          <Form.Field>
            Choose Channel <b>{this.state}</b>
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label='P2P Message'
              name='channelRdoGroup'
              value='P2P'
              checked={location.messageChannel === 'P2P'}
              onChange={onMessageChannelSelected.bind(this, stateKey)}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label='Signaling Message'
              name='channelRdoGroup'
              value='SIG'
              checked={location.messageChannel === 'SIG'}
              onChange={onMessageChannelSelected.bind(this, stateKey)}
            />
          </Form.Field>
        </Form>
      </Grid.Column>
    </Grid>
  <label>Enter Message</label>
  <input onChange={messageEntered.bind(this, stateKey)} placeholder='@message' />
    </Form.Field>
    <Button disabled={location.message === ''} primary onClick={sendMessage.bind(this, stateKey)}>Send Message</Button>
  </Form>
  </Modal.Description>
  </Modal.Content>
  </Modal>
}

  const PublicMethodsForRoom = (props) => {
    const {
      stateKey,
      location,
      shareScreen,
      stopScreen,
      leaveRoom,
      lockRoom,
    } = props;
    return <Grid.Column>
    <Button compact color='red' className='public-method-btn' onClick={leaveRoom.bind(this, stateKey)}>Leave Room</Button>
    <Button compact color='yellow' className='public-method-btn' onClick={lockRoom.bind(this, stateKey)}>{location.roomLocked ? 'Unlock Room': 'Lock Room'}</Button>
    <Button compact className='public-method-btn' primary onClick={shareScreen.bind(this, stateKey)}>Share Screen</Button>
    <Button compact color='red' className='public-method-btn' onClick={stopScreen.bind(this, stateKey)}>Stop Screen</Button>
    </Grid.Column>
  }

  const RoomSegment = (props) => {
    const {
      location,
      stateKey,
      buttonText,
      joinRoom,
      toggleAudioVideo,
      userNameEntered,
      sendMessage,
      messageEntered,
      shareScreen,
      getUserMedia,
      stopStream,
      stopScreen,
      leaveRoom,
      onPeerSelected,
      onMessageChannelSelected,
      lockRoom,
      shareScreenReplace,
      getPeersStream,
      getPeers,
    } = props;
    return (
      <Grid celled='internally'>
      {
    !location.inRoom ? <UserFormFieldCmp
    location={location}
    stateKey={stateKey}
    buttonText={buttonText}
    joinRoom={joinRoom}
    toggleAudioVideo={toggleAudioVideo}
    userNameEntered={userNameEntered}
    /> : <Grid.Row>
    <LocalFeedColumn
    stateKey={stateKey}
    location={location}
    sendMessage={sendMessage}
    messageEntered={messageEntered}

    shareScreen={shareScreen}
    shareScreenReplace={shareScreenReplace}
    getUserMedia={getUserMedia}
    stopStream={stopStream}
    stopScreen={stopScreen}
    leaveRoom={leaveRoom}
    onPeerSelected={onPeerSelected}
    onMessageChannelSelected={onMessageChannelSelected}
    lockRoom={lockRoom}
    getPeersStream={getPeersStream}
    getPeers={getPeers}
    />
    <RemoteFeedColumn stateKey={stateKey} location={location} />
  </Grid.Row>
  }
  </Grid>
  )
  };

  export default SkylinkDemo;
