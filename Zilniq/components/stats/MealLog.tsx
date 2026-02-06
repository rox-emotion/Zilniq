import { capitalize } from '@/utils/utils';
import { Text, View } from 'react-native';
import { ItemStats } from './ItemStats';

export const MealLog = ({data}) => {
 
    return (
        <View style={{borderWidth: 1, borderColor: "#DFDFDF", borderRadius: 13, marginBottom: 12}}>
            <View style={{flexDirection:"row", alignItems:'center', paddingHorizontal: 16, paddingVertical:12, borderBottomWidth: 1, borderColor:"#DFDFDF"}}>
                <View style={{marginRight:10, height:48, width:48, borderRadius:48/2, backgroundColor:"#EFF3F8", alignItems:'center', justifyContent:'center'}}>
                    <Text style={{fontSize: 26}}>{data.content.data.icon}</Text>
                </View>
                <View>
                    <Text style={{fontSize:20, fontWeight:"600", marginBottom: 2}}>{capitalize(data.content.data.mealType)}</Text>
                    <Text style={{fontSize: 14, fontWeight:"400", color:"#747474"}}>{data.content.data.totals.kcal}kcal Protein:{data.content.data.totals.protein}g Fat:{data.content.data.totals.fat}g Carbs:{data.content.data.totals.carbs}g </Text>
                </View>
            </View>
            <View style={{paddingVertical: 18}}>
                {data.content.data.items.map((foodItem: any, index: number) => {
                    return <ItemStats key={index} index={index} info={{title: foodItem?.name, kcal: foodItem?.nutrients.kcal, protein: foodItem?.nutrients.protein, fat: foodItem?.nutrients.fat, carbs: foodItem?.nutrients.carbs}}/>
                })
                }
            </View>
        </View>
    )
}