const client = new Paho.MQTT.Client("ws://104.237.1.145:8883/ws", "myClientId" + new Date().getTime());
var myTopic = 'groups/chat';

function set_topic(){
  const selectElement = document.getElementById('topics');
  const selectedValue = selectElement.options[selectElement.selectedIndex].value;
  myTopic = 'groups/'+ selectedValue;
}

client.connect({ onSuccess: onConnect })

function send_to_discord(message, user){
	fetch('https://discord.com/api/webhooks/1390820565425852508/z4-JzGV15_8OY43urGaVtTF93B0ilPVpDE0o8F0MnoIV78x_UhRKD4V4rOoYva2y0myW', {
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
	    content: message,
	    username: user,
	    avatar_url: 'https://example.com/avatar.png'
	  })
	});
}



function onConnect() {
  console.log("connection successful")
  client.subscribe(myTopic)   //subscribe to our topic
  console.log('Subscribed to topic '+ myTopic)
}

const publish = (topic, msg) => {  //takes topic and message string
    let message = new Paho.MQTT.Message(msg);
    message.destinationName = topic;
    client.send(message);
  };

client.onMessageArrived = onMessageArrived;
function onMessageArrived(message) {
    let el= document.createElement('div')
    console.log(message);
    let data = JSON.parse(message.payloadString)
    el.innerHTML = `<p>[${message.destinationName.replace('groups/', '')}] <b>${data['user']} </b>says: ${data['content']}</p>`
    document.body.appendChild(el)

   };


function send_msg (){
  let user = document.getElementById('user').value;

  if (user == undefined){
    alert('If username is not set your IP addres will be used as username ' + ip);
    return
  }
  if (user.trim() == ''){
    alert('Please select a username');
    return
  }
  let content = document.getElementById('message').value
  publish(
    myTopic,
    JSON.stringify({'user': user, "content": content})
  )

  send_to_discord(content, user);
};


function create_topic(){
  let topic_name = document.getElementById('new_topic').value;
  if (topic_name == undefined){
    alert('Invalid topic name');
    return
  }
  if (topic_name.trim() == ''){
    alert('Invalid topic name');
    return
  }
  const selectElement = document.getElementById('topics');
  const newOption = document.createElement('option');
  newOption.text = topic_name;
  newOption.value = topic_name;
  selectElement.add(newOption, null);

}

function change_topic(){
    client.unsubscribe(myTopic);
    set_topic();
    client.subscribe(myTopic);
    console.log('Subscribed to topic '+ myTopic)
}
