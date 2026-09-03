/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { FiPlus, FiEdit2} from "react-icons/fi";
import { mockCategories } from "@/mock/data";
import { CreateCategoryModal } from "./createCategory";
import {
  createCategory,
  getCategory,
  updateCategory,
  updateCategoryStatus,
} from "@/service/admin";
import { showToast } from "@/components/toast/toast";
import { toastTypes } from "@/app/constant";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<{
    id?: string;
    name: string;
    description: string;
  }>({
    id: undefined,
    name: "",
    description: "",
  });
  const getC = async () => {
    const res = await getCategory();
    if (res?.data?.success) {
      setCategories(res.data.data);
    }
  };
  console.log({ categories });
  useEffect(() => {
    getC();
  }, []);
  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Service Categories
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage global platform categories and base commission structure.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 w-fit flex items-center gap-2"
          >
            <FiPlus /> Add New Category
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Active Status</th>
                <th className="py-4 px-6 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-bold text-slate-900">
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                    {cat.description}
                  </td>
                  <td className="py-4 px-6 text-xs font-bold text-slate-700">
                    {/* Services Listed */}
                    {/* {cat.serviceCount} Services Listed */}
                    <span
                      onClick={async () => {
                        const res = await updateCategoryStatus(cat.id, {
                          status: !cat.status,
                        });
                        if (res?.data?.success) {
                          getC();
                        }
                      }}
                      className={`inline-flex items-center cursor-pointer rounded-md ${cat.status ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} px-2 py-1 text-xs font-medium inset-ring inset-ring-green-600/20`}
                    >
                      {cat.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedCat(cat);
                          setIsOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      {/* <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CreateCategoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedCat={selectedCat}
        onSubmit={async (v) => {
          let res;
          if (selectedCat?.id) {
            res = await updateCategory(selectedCat.id, v);
          } else {
            res = await createCategory(v);
          }

          if (res?.data?.success) {
            getC();
            setIsOpen(false);
            setSelectedCat({ id: undefined, name: "", description: "" });
            showToast(
              toastTypes.SUCCESS,
              selectedCat?.id
                ? "Category updated successfully!"
                : "Category created successfully!",
            );
          }
        }}
      />
    </>
  );
}
