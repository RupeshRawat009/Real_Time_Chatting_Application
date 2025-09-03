import React, { useState, useContext, useEffect } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || '');
      setBio(authUser.bio || '');
    }
  }, [authUser]);

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submitting profile update...");

  if (!authUser) {
    toast.error("User not authenticated");
    navigate('/login');
    return;
  }

  setLoading(true);

  try {
    let base64Image = null;

    if (selectedImg) {
      base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImg);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("Failed to read image file");
      });

      if (!base64Image.startsWith("data:image")) {
        toast.error("Invalid image format");
        setLoading(false);
        return;
      }
    }

    const payload = {
      fullName: name,
      bio,
      ...(base64Image && { profilePic: base64Image }),
    };

    const success = await updateProfile(payload);
    console.log("Update success:", success);

    if (success) navigate('/');
  } catch (err) {
    toast.error(err.message || "Profile update failed");
    console.error("Submit error:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile details</h3>

          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id='avatar'
              accept='.png,.jpg,.jpeg'
              hidden
            />
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)}
              alt="Profile"
              className='w-12 h-12 rounded-full'
            />
            upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder='Your name'
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Write profile bio'
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            rows={4}
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer ${loading && 'opacity-50 cursor-not-allowed'}`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        <img
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`}
          src={authUser?.profilePic || assets.logo_icon}
          alt="Preview"
        />
      </div>
    </div>
  );
};

export default ProfilePage;