'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function TokenForm() {
  const { publicKey, connected } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 1000000000,
    description: '',
    logo: null as File | null,
    revokeMint: true,
    revokeFreeze: true,
    revokeUpdate: true,
    socialLinks: false,
    creatorInfo: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        logo: e.target.files[0]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would integrate with your token creation logic
  };

  return (
    <div id="create-token" className="opacity-100 py-8">
      <div className="title-box text-center mb-8">
        <div className="title-text text-3xl md:text-4xl font-bold text-white mb-3">
          Solana Token Creator
        </div>
        <div className="title-desc text-gray-400">
          <span className="span-1 block">Create and deploy your Solana coin effortlessly in seconds.</span>
          <span className="span-2 block">Reach the world and scale without limits!</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="token-creation-box max-w-3xl mx-auto bg-[#171717] rounded-xl p-6 shadow-xl">
        <div className="form-section mb-8">
          <div className="form-field mb-4">
            <label className="field-label block text-gray-300 mb-2">Token Name *</label>
            <input 
              placeholder="Ex: Moon Coin" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <span className="field-constraint text-xs text-gray-500 mt-1 block">Max 32 characters in your name</span>
          </div>

          <div className="form-field mb-4">
            <label className="field-label block text-gray-300 mb-2">Token Symbol *</label>
            <input 
              placeholder="Ex: MOON" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
              type="text" 
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-field mb-4">
            <label className="field-label block text-gray-300 mb-2">Decimals *</label>
            <input 
              placeholder="Ex: 9" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
              type="number" 
              name="decimals"
              value={formData.decimals}
              onChange={handleInputChange}
              required
            />
            <span className="field-constraint text-xs text-gray-500 mt-1 block">Change the number of decimals for your token</span>
          </div>

          <div className="form-field mb-4">
            <label className="field-label block text-gray-300 mb-2">Supply *</label>
            <input 
              placeholder="Ex: 1000000000" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
              type="number" 
              name="supply"
              value={formData.supply}
              onChange={handleInputChange}
              required
            />
            <span className="field-constraint text-xs text-gray-500 mt-1 block">The initial number of available tokens that will be created in your wallet</span>
          </div>

          <div className="logo-wrapper grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="logo-box">
              <span className="label-text block text-gray-300 mb-2">Logo *</span>
              <div className="img-input-wrapper border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors" onClick={() => document.querySelector<HTMLInputElement>('.form-img')?.click()}>
                <span className="material-symbols-rounded text-3xl mb-2 text-gray-400 block">upload</span>
                <span className="text-1 block text-gray-300 mb-1">Drag and drop here to upload</span>
                <div className="text-2 text-xs text-gray-500">.png, .jpg 1000x1000 px</div>
                <input 
                  accept=".png, .jpg, .jpeg" 
                  className="form-img hidden" 
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <span className="field-constraint text-xs text-gray-500 mt-1 block">Add logo for your token</span>
            </div>
            
            <div className="logo-preview flex items-center justify-center">
              {formData.logo ? (
                <img 
                  src={URL.createObjectURL(formData.logo)} 
                  alt="Token Logo Preview" 
                  className="max-h-40 rounded-lg border border-gray-700"
                />
              ) : (
                <div className="text-gray-500 text-sm">Logo preview will appear here</div>
              )}
            </div>
          </div>

          <div className="form-field mb-4">
            <label className="field-label block text-gray-300 mb-2">Description *</label>
            <textarea 
              placeholder="Here you can describe your token" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white h-24" 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-divider border-t border-gray-700 my-6"></div>

        <div className="form-section mb-8">
          <div className="toggle-section mb-4">
            <div className="toggle-section-header flex justify-between items-center mb-2">
              <div className="toggle-header-left flex items-center">
                <div className="toggle-wrapper mr-3">
                  <input 
                    id="creatorInfo" 
                    type="checkbox" 
                    name="creatorInfo"
                    checked={formData.creatorInfo}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div 
                    className={`toggle w-12 h-6 rounded-full p-1 cursor-pointer ${formData.creatorInfo ? 'bg-purple-600' : 'bg-gray-700'}`}
                    onClick={() => setFormData({...formData, creatorInfo: !formData.creatorInfo})}
                  >
                    <div className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${formData.creatorInfo ? 'translate-x-6' : ''}`}></div>
                  </div>
                </div>
                <div className="toggle-label text-gray-300">Creator's Info (Optional)</div>
              </div>
              <div className="toggle-cost text-purple-500">+0.1 SOL</div>
            </div>
            <div className="toggle-section-description text-xs text-gray-500">
              Change the information of the creator in the metadata. By default, it is SolMinter.
            </div>
          </div>

          <div className="toggle-section mb-4">
            <div className="toggle-section-header flex justify-between items-center mb-2">
              <div className="toggle-header-left flex items-center">
                <div className="toggle-wrapper mr-3">
                  <input 
                    id="socialLinks" 
                    type="checkbox" 
                    name="socialLinks"
                    checked={formData.socialLinks}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div 
                    className={`toggle w-12 h-6 rounded-full p-1 cursor-pointer ${formData.socialLinks ? 'bg-purple-600' : 'bg-gray-700'}`}
                    onClick={() => setFormData({...formData, socialLinks: !formData.socialLinks})}
                  >
                    <div className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${formData.socialLinks ? 'translate-x-6' : ''}`}></div>
                  </div>
                </div>
                <div className="toggle-label text-gray-300">Add Social Links & Tags</div>
              </div>
              <div className="toggle-cost text-purple-500">+0.1 SOL</div>
            </div>
            <div className="toggle-section-description text-xs text-gray-500">
              Add links to your token metadata.
            </div>
          </div>
        </div>

        <div className="form-divider border-t border-gray-700 my-6"></div>

        <div className="form-section mb-8">
          <div className="form-section-title text-xl text-white mb-4">Revoke Authorities (Investor's Booster)</div>
          
          <div className="form-section-authorities space-y-4">
            <div className="form-checkbox-field">
              <div className="form-checkbox-header flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className="form-checkbox-label text-gray-300 mr-3">Revoke Freeze</div>
                  <div 
                    className={`checkbox w-5 h-5 border ${formData.revokeFreeze ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                    onClick={() => setFormData({...formData, revokeFreeze: !formData.revokeFreeze})}
                  >
                    {formData.revokeFreeze && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-checkbox-description text-xs text-gray-500">
                No one will be able to freeze holders' token accounts anymore
              </div>
              <div className="form-checkbox-cost text-xs text-purple-500 mt-1">+0.1 SOL</div>
            </div>

            <div className="form-checkbox-field">
              <div className="form-checkbox-header flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className="form-checkbox-label text-gray-300 mr-3">Revoke Mint</div>
                  <div 
                    className={`checkbox w-5 h-5 border ${formData.revokeMint ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                    onClick={() => setFormData({...formData, revokeMint: !formData.revokeMint})}
                  >
                    {formData.revokeMint && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-checkbox-description text-xs text-gray-500">
                No one will be able to create more tokens anymore
              </div>
              <div className="form-checkbox-cost text-xs text-purple-500 mt-1">+0.1 SOL</div>
            </div>

            <div className="form-checkbox-field">
              <div className="form-checkbox-header flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className="form-checkbox-label text-gray-300 mr-3">Revoke Update</div>
                  <div 
                    className={`checkbox w-5 h-5 border ${formData.revokeUpdate ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                    onClick={() => setFormData({...formData, revokeUpdate: !formData.revokeUpdate})}
                  >
                    {formData.revokeUpdate && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-checkbox-description text-xs text-gray-500">
                No one will be able to modify token metadata anymore
              </div>
              <div className="form-checkbox-cost text-xs text-purple-500 mt-1">+0.1 SOL</div>
            </div>
          </div>
          
          <div className="form-section-description text-xs text-gray-500 mt-4">
            Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract more investors.
          </div>
        </div>

        <div className="submit-section flex flex-col md:flex-row justify-between items-center mt-8">
          <button 
            type="submit" 
            className={`submit-btn bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all w-full md:w-auto mb-4 md:mb-0 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            {connected ? 'Launch Token' : 'Connect Wallet to Launch'}
          </button>
          
          <div className="token-fees-container text-right">
            <div className="fees-label text-gray-400 text-sm">Total Fees:</div>
            <div className="flex items-center">
            <div className="fees-original text-gray-500 text-sm">0.2+<del>0.6 SOL</del></div>
              <div className="fees-discounted text-purple-500 text-xl font-semibold ml-2">0.3 SOL</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}