import DayHeader from '@/components/stats/DayHeader';
import { Graph } from '@/components/stats/Graph';
import { MealStats } from '@/components/stats/MealStats';
import { RoundProgressIndicator } from '@/components/stats/RoundProgressIndicator';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function Stats() {
    const kcalGoal = 2560
    const proteinGoal = 100
    const fatGoal = 78
    const carbsGoal = 150

    const { getToken } = useAuth(); 

    const [totals, setTotals] = useState({kcal: '0', carbs: '0', fat: '0', protein: '0'})
    const [progress, setProgress] = useState({kcal: 0, carbs: 0, fat: 0, protein: 0})
    const [meals, setMeals] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchDailyTotals = async () => {
        const token = await getToken(); 
        const formattedDate = selectedDate.toISOString().split('T')[0]

        const response = await fetch(
        `https://payload-cms-production-c64b.up.railway.app/api/analytics/daily?date=${formattedDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      setTotals({kcal: String(data.totals.kcal).slice(0, 5), carbs: String(data.totals.carbs).slice(0, 5), fat: String(data.totals.fat).slice(0, 5), protein: String(data.totals.protein).slice(0, 5)})
      setProgress({kcal: data.totals.kcal / kcalGoal, carbs: data.totals.carbs / carbsGoal, fat: data.totals.fat / fatGoal, protein: data.totals.protein / proteinGoal})
    }

    const getMealsInfo = async () => {
        const token = await getToken(); 
        const formattedDate = selectedDate.toISOString().split('T')[0]

        const response = await fetch(
        `https://payload-cms-production-c64b.up.railway.app/api/history/day/${formattedDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      setMeals(data.entries)
    }

    useEffect(() => {
        fetchDailyTotals()
        getMealsInfo()
    },[selectedDate])

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    return (
        <View style={{flex: 1, backgroundColor:"#FFF"}}>
            <DayHeader
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                goalKcal={2560}
            />
            
            <ScrollView 
                style={{flex: 1}} 
                contentContainerStyle={{paddingBottom: 32}}
            >
                <View style={{justifyContent: "center", alignItems: "center"}}>
                    <Text style={{fontSize:26, fontWeight:"500", marginBottom:24}}>Stats</Text>
                </View>
                
                <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
                    <RoundProgressIndicator progress={progress.kcal} color={"#2DCC74"} value={totals.kcal} measure="kcal" text="Calories" />
                    <RoundProgressIndicator progress={progress.protein} color={"#FFA931"} value={totals.protein} measure="grams" text="Protein"/>
                    <RoundProgressIndicator progress={progress.fat} color={"#F3D511"} value={totals.fat} measure="grams" text="Fat"/>
                </View>

                <Text style={{fontSize: 26, fontWeight:"500", alignSelf:"center", marginTop:72, marginBottom: 12}}>This week overview</Text>
                <Text style={{fontSize: 18, fontWeight:"400", alignSelf:"center", marginTop: 8}}>Goals: 2560 Kcal</Text>

                <Graph date={selectedDate}/>
                
                {meals.length > 0 &&
                    <View style={{flexDirection:"row", justifyContent:'space-between', alignItems:"center", paddingHorizontal:16, paddingBottom:12, marginTop: 36}}>
                        <Text style={{fontWeight:"500", fontSize: 22}}>Your Meals</Text>
                        <Text style={{fontSize: 15, fontWeight:"400"}}>{meals.length} meals</Text>
                    </View>
                }
              
                {meals.map((meal, index) => {
                    return <MealStats key={index} data={meal}/>
                })}
            </ScrollView>
        </View>
    )
}