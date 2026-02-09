import { capitalize } from '@/utils/utils';
import { Text, View } from 'react-native';
export const ItemStats = ({index, info} : {index: number, info: any}) => {

    const title = info?.title || info?.name
    const kcal = info?.kcal || info?.nutrients?.kcal
    const protein = info?.protein || info?.nutrients?.protein
    const fat = info?.fat || info?.nutrients?.fat
    const carbs = info?.carbs || info?.nutrients?.carbs
    const quantity = info.quantity
    const unit = info.unit === "piece" ? "pcs" : info.unit === "pieces" ? "pcs" : info.unit

    const deleteItem = () => {
        //todo
    }

    return (
        <View style={{paddingHorizontal: 20}}>

            {index != 0 &&
                <View style={{flex:1, borderWidth:1, borderColor:"#DFDFDF", height:1, marginVertical: 18}}/> 
            }
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 8}}>
                <Text style={{fontSize: 20, fontWeight:"600"}}>{capitalize(title)} - {quantity}{unit}</Text>
                {/* <Pressable onPress={deleteItem}>
                    <CloseIcon />
                </Pressable> */}
            </View>
            <View style={{flexDirection:"row", justifyContent:'space-between', alignItems:'center' }}>
                <View style={{flexDirection: "row", gap: 4, alignItems:'center'}}>
                    <View style={{width:4, height:14, backgroundColor:"#2DCC74", borderRadius:4}}/>
                    <Text>{kcal} kcal</Text>
                </View>

                <View style={{flexDirection: "row", gap: 4, alignItems:'center'}}>
                    <View style={{width:4, height:14, backgroundColor:"#FFA931", borderRadius:4}}/>
                    <Text>Protein: {protein}g</Text>
                </View>

                <View style={{flexDirection: "row", gap: 4, alignItems:'center'}}>
                    <View style={{width:4, height:14, backgroundColor:"#F3D511", borderRadius:4}}/>
                    <Text>Fat: {fat}g</Text>
                </View>

                <View style={{flexDirection: "row", gap: 4, alignItems:'center'}}>
                    <View style={{width:4, height:14, backgroundColor:"#11B7F3", borderRadius:4}}/>
                    <Text style={{color:'black'}}>Carbs: {carbs}g</Text>
                </View>
            </View>

        </View>
    )
}