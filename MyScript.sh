#!/bin/sh
echo "hahaha"

totalTimeSteps=6000


# for alienNum in 5 50
# do
# 	echo $alienNum
# 	for soldierNum in 5 50
# 	do
# 		echo $soldierNum
# 		for townfolkNum in 5 50
# 		do
# 			echo $townfolkNum
# 			for mapSize in [50,50] [100,100] [500,500]
# 			do
# 				echo $mapSize
# 				node /Users/qianwenlyu/PhD/Simulation/AlienInvasionSimulation/main.js $totalTimeSteps $alienNum $soldierNum $townfolkNum $mapSize
# 			done
# 		done
# 	done
	

# done


for i in {1...10}
do
	echo $i
	node /Users/qianwenlyu/PhD/Simulation/AlienInvasionSimulation/main.js $totalTimeSteps 10 10 10 [100,100]
done
