#!/bin/sh
echo "hahaha"

totalTimeSteps=2000


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


for i in {1..100}
do
	echo $i
	# alien:soldier:townfolk
	# for characterNum in 20 50 100
	for characterNum in 100
	do
		# for totalTimeSteps in 4000 6000 10000
		# do
			node /Users/qianwenlyu/PhD/Simulation/AlienInvasionSimulation/main.js $totalTimeSteps $characterNum [2,1,2] [100,100] $i
		# done
	done
done
