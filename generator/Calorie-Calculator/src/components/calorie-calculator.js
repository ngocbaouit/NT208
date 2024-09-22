import { useState } from "react";
import LoadingSpinner from "@/components/spinner";
import AlertModal from "@/components/model/alert"; // Assuming AlertModal is exported as default from "@/components/model/alert"

// Defines the main component for the calorie calculator page
export const CalorieCalculatorPage = () => {
    // State hooks for managing various states
    const [uploadedImage, setUploadedImage] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [totalCalories, setTotalCalories] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const base64Image = await getBase64(file);
                setUploadedImage(base64Image); // Updates state with the base64 encoded image
                sendImageToServer(base64Image); // Sends the base64 encoded image to the server
            } catch (error) {
                console.error('Lỗi đọc file:', error);
            }
        }
    };

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // Resolves the promise upon successful file read
            reader.onerror = error => reject(error); // Rejects the promise if file reading fails
            reader.readAsDataURL(file); // Reads the file as a base64 data URL
        });
    };

    // Component for uploading images
    const ImageUpload = ({ onUpload, uploadedImage }) => {
        return (
            <div className="text-center p-4">
                <input id="upload" type="file" accept="image/*" onChange={onUpload} className="d-none" />
                <div className="image-container bg-white rounded overflow-hidden">
                    {uploadedImage && <img src={uploadedImage} alt="Uploaded Food" className="img-fluid" style={{ maxHeight: '380px' }} />}
                </div>
            </div>
        );
    };     
    // Sends the base64 encoded image to the server for processing
    const sendImageToServer = (base64Image) => {
        setLoading(true);
        fetch('/api/detect_food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Image }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setFoodItems(data.items);
                    setTotalCalories(data.count);
                } else {
                    setShowAlert(true);
                    setAlertMessage(data.message);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Lỗi:', error);
                // Show AlertModal on error
                setLoading(false);
                setShowAlert(true);
                setAlertMessage('Phân tích ảnh bị lỗi. Vui lòng thử lại');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Closes the alert modal
    const closeAlertModal = () => setShowAlert(false);

    // Component displaying the result of food detection
    const FoodDetection = () => {
        return (
            <div className="flex-fill d-flex flex-column justify-content-between bg-light rounded shadow">
                <div className="p-4">
                    <h2 className="h4 font-weight-bold text-center mb-4 text-white">Món ăn nhận biết được</h2>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {foodItems.map((item, index) => (
                            <span key={index} className="badge rounded-pill bg-primary p-4 text-sm md:text-base">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="divider"></div>
                <div className="p-4 text-center">
                    <h3 className="h5 font-weight-bold text-gray-700">Tổng Calories:</h3>
                    <p className="h4 font-weight-bold text-primary">{totalCalories} cal</p>
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-2">
            {isLoading && (
                <LoadingSpinner />
            )}
            <div className="alert alert-info bg-primary bg-opacity-25 shadow-lg max-w-4xl w-100 mb-4 py-4">
                <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 me-2" fill="none" viewBox="0 0 24 24" style={{ height: '16px', width: '16px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Chúng tôi sử dụng Google Gemini để xây dựng công cụ này, hãy trải nghiệm nó trên website 14Cooking...</span>
                </div>
            </div>
    
            <div className="container-md p-5 bg-light shadow rounded">
                <h1 className="text-center mb-4">Calorie Calculator</h1>
                <label htmlFor="upload" className="btn btn-primary mb-4">
                    Tải lên hình ảnh món ăn của bạn
                </label>
    
                <div className="row">
                    <div className="col-md">
                        <div className="border border-dashed h-200 border-gray-300 rounded-lg d-flex justify-content-center align-items-center bg-white ">
                            <ImageUpload onUpload={handleImageUpload} uploadedImage={uploadedImage} />
                            {!uploadedImage && (
                                <div className="position-absolute inset-0 d-flex flex-column justify-content-center align-items-center text-gray-500">
                                    <p>Chưa có hình ảnh nào được tải lên</p>
                                    <p className="mt-2">Hình ảnh bạn đã tải lên sẽ hiển thị ở đây</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md">
                        <FoodDetection />
                    </div>
                </div>
            </div>
            <AlertModal show={showAlert} onClose={closeAlertModal} type="error" message={alertMessage} />
        </div>
    );
}
    export default CalorieCalculatorPage;    