import { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddCar = () => {
  const { axios, currency } = useAppContext()

  // State to store uploaded car image
  const [carImage, setCarImage] = useState(null)

  // State to store all car details from the form
  const [carDetails, setCarDetails] = useState({
    brand:'', model:'', year:0, pricePerDay:0, category:'', transmission:'', fuelType:'', seatingCapacity:0, location:'', description:''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to handle form submission of new car to the server
  const submitCar = async (formSubmission) => {
    formSubmission.preventDefault()  // Prevent default form submission
    if (isSubmitting) return // Avoid multiple submissions

    setIsSubmitting(true) // Set loading state
    try {
      // Create form data to send image and car details
      const formData = new FormData()
      formData.append('image', carImage)
      formData.append('carData', JSON.stringify(carDetails))

      // Send data to server
      const response = await axios.post('/api/owner/add-car', formData)
      if (response.data.success) {
        toast.success(response.data.message) // Notify success
        setCarImage(null) // Reset image input
        // Reset all car details in the form
        setCarDetails({ brand:'', model:'', year:0, pricePerDay:0, category:'', transmission:'', fuelType:'', seatingCapacity:0, location:'', description:'' })
      } else toast.error(response.data.message) // Show server error
    } catch (error) {
      toast.error(error.message) // Show network or unexpected error
    } finally {
      setIsSubmitting(false) // Reset loading state
    }
  }

  // Function to update specific car detail in state
  const handleInputChange = (field, value) => setCarDetails({...carDetails, [field]: value})

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <Title title='Add New Car' subTitile='Fill in details to list a new car for booking, including pricing, availability and specifications' />

      <form onSubmit={submitCar} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>

        {/* Car Image */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="car-image">
            <img src={carImage ? URL.createObjectURL(carImage) : assets.upload_icon} alt="Car" className='h-14 rounded cursor-pointer' />
            <input type="file" id='car-image' accept='image/*' hidden onChange={fileSelection => setCarImage(fileSelection.target.files[0])} />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        {/* Brand & Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['brand','model'].map(field => (
            <div key={field} className='flex flex-col w-full'>
              <label>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
              <input type="text" placeholder={field==='brand'?'BMW, Mercedes...':'X5, E-Class...'} required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
                value={carDetails[field]} onChange={change => handleInputChange(field, change.target.value)} 
              />
            </div>
          ))}
        </div>

        {/* Year, Price, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {label:'Year', field:'year', type:'number'},
            {label:`Daily Price (${currency})`, field:'pricePerDay', type:'number'},
            {label:'Category', field:'category', options:['Sedan','SUV','Van']}
          ].map(input => (
            <div key={input.field} className='flex flex-col w-full'>
              <label>{input.label}</label>
              {input.options ? (
                <select value={carDetails[input.field]} onChange={change => handleInputChange(input.field, change.target.value)} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
                  <option value="">Select {input.label}</option>
                  {input.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input type={input.type} placeholder='0' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                  value={carDetails[input.field]} onChange={change => handleInputChange(input.field, change.target.value)} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Transmission, Fuel Type, Seating Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {label:'Transmission', field:'transmission', options:['Automatic','Manual','Semi-Automatic']},
            {label:'Fuel Type', field:'fuelType', options:['Gas','Diesel','Petrol','Electric','Hybrid']},
            {label:'Seating Capacity', field:'seatingCapacity', type:'number'}
          ].map(input => (
            <div key={input.field} className='flex flex-col w-full'>
              <label>{input.label}</label>
              {input.options ? (
                <select value={carDetails[input.field]} onChange={change => handleInputChange(input.field, change.target.value)} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
                  <option value="">Select {input.label}</option>
                  {input.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input type="number" placeholder='4' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
                  value={carDetails[input.field]} onChange={change => handleInputChange(input.field, change.target.value)} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Location */}
        <div className='flex flex-col w-full'>
          <label>Location</label>
          <select value={carDetails.location} onChange={change => handleInputChange('location', change.target.value)} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
            <option value="">Select a Location</option>
            {['New York','Los Angeles','Houston','Chicago'].map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className='flex flex-col w-full'>
          <label>Description</label>
          <textarea rows={5} placeholder='A luxurious SUV with spacious interior and powerful engine' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            value={carDetails.description} onChange={change => handleInputChange('description', change.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer'>
          <img src={assets.tick_icon} alt="Tick icon" />
          {isSubmitting ? 'Listing...' : 'List Your Car'}
        </button>
      </form>
    </div>
  )
}

export default AddCar;