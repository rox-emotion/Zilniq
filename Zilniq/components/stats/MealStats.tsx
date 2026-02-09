import { capitalize, normalizeDate } from '@/utils/utils';
import { Text, View } from 'react-native';
import { ItemStats } from './ItemStats';

export const MealStats = ({data}) => {
    const kcal = data.totals.kcal
    const protein = data.totals.protein
    const fat = data.totals.fat
    const carbs = data.totals.carbs
    const title = data.mealType
    const time = normalizeDate(data.entryDate)
 
    return(
        <View>
            <View style={{backgroundColor: "#EFF3F8", padding: 20, paddingBottom: 20}}>
                <View style={{flexDirection: "row", justifyContent:"space-between", alignItems: "center"}}>
                    <Text style={{fontSize:24, fontWeight:"700"}}>{capitalize(title)}</Text>
                    {/* <Text style={{fontSize: 15, color: "#747474", fontWeight: "400"}}>{time}</Text> */}
                </View>
                <View style={{flexDirection:"row", justifyContent:'space-between', marginTop: 6}}>
                    <Text style={{fontSize: 18, fontWeight:"400", color: "#747474"}}>{kcal} Kcal</Text>
                    <Text style={{fontSize: 18, fontWeight:"400", color: "#747474"}}>Protein: {protein}g</Text>
                    <Text style={{fontSize: 18, fontWeight:"400", color: "#747474"}}>Fat: {fat}g</Text>
                    <Text style={{fontSize: 18, fontWeight:"400", color: "#747474"}}>Carbs: {carbs}g</Text>
                </View>
            </View>
            <View style={{paddingVertical: 18}}>
                {data.items.map((food, index) => {
                return <ItemStats key={index} index={index} info={food} />
                })}
            </View>
        </View>
    )
}
