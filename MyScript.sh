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


# for i in {1..1000}
# do
# 	echo $i
	# alien:soldier:townfolk
	node /Users/qianwenlyu/PhD/Simulation/AlienInvasionSimulation/main.js $totalTimeSteps 30 [1,2,3] [100,100] $i
# done
