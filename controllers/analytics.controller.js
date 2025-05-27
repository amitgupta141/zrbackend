import { db } from "../lib/firebase.js"; // Import Firestore
import { collection, getDocs, query, where } from "firebase/firestore";

export const getAnalyticsData = async () => {
	const usersSnapshot = await getDocs(collection(db, "users"));
	const totalUsers = usersSnapshot.size;

	const productsSnapshot = await getDocs(collection(db, "products"));
	const totalProducts = productsSnapshot.size;

	const salesData = await getSalesData(); // Implement this function to fetch sales data

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales: salesData.totalSales,
		totalRevenue: salesData.totalRevenue,
	};
};

const getSalesData = async () => {
	const ordersSnapshot = await getDocs(collection(db, "orders"));
	let totalSales = 0;
	let totalRevenue = 0;

	ordersSnapshot.forEach((doc) => {
		totalSales += 1;
		totalRevenue += doc.data().totalAmount;
	});

	return { totalSales, totalRevenue };
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await getDailySales(); // Implement this function to fetch daily sales data

		const dateArray = getDatesInRange(startDate, endDate);
		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item.date === date);
			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}