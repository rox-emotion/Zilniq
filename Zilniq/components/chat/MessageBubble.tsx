import { Message } from "@/types/message"
import { normalizeDate } from "@/utils/utils"
import { Text, View } from "react-native"

export default function MessageBubble ({message} : {message : Message}) {

    const isMe = message.sender === "user"
    
    return (
        <View>
            <View 
            style={{
                backgroundColor: isMe? "#EFF3F8" : "none",
                borderTopEndRadius:30,
                borderBottomStartRadius:30,
                borderTopStartRadius:30,
                alignSelf: isMe? "flex-end" : "flex-start",
                maxWidth: '90%',
                paddingHorizontal: isMe? 25: 0,
                paddingVertical: isMe? 18 : 12,
                marginBottom: 8
            }}
            >
                <Text style={{lineHeight: 24, fontSize: 16}}>
                    {message?.blocks?.[0]?.content || ''}
                </Text>
            </View>
            {   isMe && <Text style={{fontSize:12, color:"#484859", alignSelf:'flex-end'}}>{normalizeDate(message?.timestamp)}</Text>}
        </View>
    )
}