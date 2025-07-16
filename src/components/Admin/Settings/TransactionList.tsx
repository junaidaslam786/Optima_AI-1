"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import {
  useGetTransactionsQuery,
  useUpdateTransactionMutation,
} from "@/redux/features/transactions/transactionsApi";
import { Transaction } from "@/redux/features/transactions/transactionsTypes";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { withAuth } from "@/components/Auth/withAuth";

const TransactionList: React.FC = () => {
  const {
    data: transactions,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTransactionsQuery();
  const [updateTransaction] = useUpdateTransactionMutation();

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Helper for error messages
  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
  ): string => {
    if (!error) return "An unknown error occurred.";
    if ("status" in error) {
      const fetchError = error as FetchBaseQueryError;
      return typeof fetchError.data === "object" &&
        fetchError.data !== null &&
        "error" in fetchError.data &&
        typeof fetchError.data.error === "string"
        ? fetchError.data.error
        : `API Error: ${fetchError.status}`;
    } else if ("message" in error) {
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to load transactions: ${getErrorMessage(error)}`);
      setAlert({
        type: "error",
        message: `Failed to load transactions: ${getErrorMessage(error)}`,
      });
    }
  }, [isError, error]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({ ...transaction });
  };

  const handleSave = async () => {
    if (!editingTransaction) return;

    try {
      await updateTransaction(editingTransaction).unwrap();
      toast.success("Transaction updated successfully!");
      setAlert({
        type: "success",
        message: "Transaction updated successfully!",
      });
      setEditingTransaction(null);
      refetch();
    } catch (err: unknown) {
      console.error("Failed to update transaction:", err);
      toast.error(
        `Failed to update transaction: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      setAlert({
        type: "error",
        message: `Failed to update transaction: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Admin Transactions
      </h1>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {transactions?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No transactions found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.order_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.users?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${transaction.transaction_amount.toFixed(2)}{" "}
                    {transaction.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.payment_gateway}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.transaction_status === "succeeded"
                          ? "bg-green-100 text-green-800"
                          : transaction.transaction_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.transaction_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.transaction_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                      className="mr-2"
                    >
                      Edit Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Transaction Status
            </h2>
            <p className="mb-4 text-gray-700">
              Transaction ID: {editingTransaction.id.substring(0, 8)}...
            </p>
            <div className="mb-4">
              <label
                htmlFor="transaction_status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="transaction_status"
                name="transaction_status"
                value={editingTransaction.transaction_status}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    transaction_status: e.target.value as
                      | "pending"
                      | "succeeded"
                      | "failed"
                      | "refunded",
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            {editingTransaction.transaction_status === "failed" && (
              <Input
                label="Error Message (Optional)"
                id="error_message"
                value={editingTransaction.error_message || ""}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    error_message: e.target.value,
                  })
                }
                placeholder="e.g., Card declined"
              />
            )}
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setEditingTransaction(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(TransactionList, { allowedRoles: ["admin"] });
